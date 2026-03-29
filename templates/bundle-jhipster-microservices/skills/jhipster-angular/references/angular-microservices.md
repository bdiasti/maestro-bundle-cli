# Angular Patterns for Microservices

## Architecture
- Angular app lives in the Gateway
- Gateway routes API calls transparently to microservices
- From Angular's view, it is a single API

## Data Aggregation Pattern
```typescript
// Use forkJoin to fetch from multiple services simultaneously
forkJoin({
  demands: this.demandService.query(),
  agents: this.agentService.query(),
}).subscribe(({ demands, agents }) => {
  // Combine data
});
```

## Resilience Pattern
```typescript
// Wrap each service call with catchError
this.demandService.query().pipe(
  catchError(() => of([]))  // Return empty on failure
)
```

## Real-Time Pattern
```typescript
// WebSocket via STOMP through Gateway
this.stompClient.watch('/topic/events').pipe(
  map(msg => JSON.parse(msg.body))
).subscribe(event => { /* handle */ });
```

## Best Practices
- Always handle partial failures
- Show fallback UI when a service is unavailable
- Use lazy loading for feature modules
- Keep entity services in `entities/` directory
- Custom aggregation services outside `entities/`
