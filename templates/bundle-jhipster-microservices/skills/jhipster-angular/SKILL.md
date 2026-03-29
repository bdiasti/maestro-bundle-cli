---
name: jhipster-angular
description: Develop Angular frontend in the JHipster Gateway consuming multiple microservices. Use when creating screens that aggregate data from multiple services, handling partial failures, or customizing the Gateway frontend.
version: 1.0.0
author: Maestro
---

# JHipster Angular -- Microservices

Develop the Angular frontend hosted in the Gateway, which transparently consumes multiple microservices through the Gateway's routing.

## When to Use
- When creating screens that aggregate data from multiple services
- When building dashboards with data from different microservices
- When handling partial service failures gracefully in the UI
- When adding WebSocket real-time features via the Gateway

## Available Operations
1. Create services that aggregate data from multiple backends
2. Handle partial service failures with fallback UI
3. Add WebSocket real-time updates
4. Build cross-service dashboards
5. Customize entity components from different services

## Multi-Step Workflow

### Step 1: Understand the Architecture

```
Browser --> Gateway:8080/api/demands --> demand-service:8081/api/demands
Browser --> Gateway:8080/api/agents  --> agent-service:8082/api/agents
```

The Angular app lives in the Gateway. From Angular's perspective, everything is a single API.

### Step 2: Create Services That Aggregate Data

```typescript
// dashboard.service.ts -- aggregates data from multiple services (via gateway)
@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(
    private demandService: DemandService,
    private agentService: AgentService,
    private trackingService: TrackingService,
  ) {}

  getMetrics(): Observable<DashboardMetrics> {
    return forkJoin({
      activeDemands: this.demandService.countByStatus('IN_PROGRESS'),
      activeAgents: this.agentService.countByStatus('BUSY'),
      completedToday: this.trackingService.getCompletedToday(),
      complianceRate: this.trackingService.getComplianceRate(),
    });
  }
}
```

### Step 3: Handle Partial Service Failures

```typescript
getMetrics(): Observable<DashboardMetrics> {
  return forkJoin({
    activeDemands: this.demandService.countByStatus('IN_PROGRESS').pipe(
      catchError(() => of({ count: -1 }))  // -1 = unavailable
    ),
    activeAgents: this.agentService.countByStatus('BUSY').pipe(
      catchError(() => of({ count: -1 }))
    ),
  });
}
```

```html
<div *ngIf="metrics.activeDemands.count >= 0; else unavailable">
  {{ metrics.activeDemands.count }}
</div>
<ng-template #unavailable>
  <span class="text-muted">Unavailable</span>
</ng-template>
```

### Step 4: Add WebSocket for Real-Time Updates

```typescript
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private stompClient: RxStomp;

  connect(): void {
    this.stompClient = new RxStomp();
    this.stompClient.configure({
      brokerURL: `ws://${location.host}/websocket`,
    });
    this.stompClient.activate();
  }

  onAgentEvent(): Observable<TrackingEvent> {
    return this.stompClient.watch('/topic/tracking').pipe(
      map(msg => JSON.parse(msg.body))
    );
  }
}
```

### Step 5: Build and Verify

```bash
npm start
npm test
npm run lint
npm run build
```

## Resources
- `references/angular-microservices.md` - Angular patterns for microservices architecture

## Examples
### Example 1: Build a Cross-Service Dashboard
User asks: "Create a dashboard showing demands, agents, and metrics"
Response approach:
1. Create `DashboardService` using `forkJoin` to aggregate data
2. Add `catchError` for each service call
3. Create dashboard component with metric cards
4. Show "Unavailable" when a service is down
5. Run `npm start` to verify

### Example 2: Handle Service Outage
User asks: "The agent-service is down, the dashboard crashes"
Response approach:
1. Add `catchError(() => of(fallbackValue))` to the agent-service call
2. Show graceful "unavailable" UI instead of error
3. Other service data should still display correctly

## Notes
- Frontend lives in the Gateway, NOT in individual services
- Treat partial failures gracefully -- show what you can
- Use `forkJoin` for aggregation, `catchError` for resilience
- Use lazy loading per module/feature
