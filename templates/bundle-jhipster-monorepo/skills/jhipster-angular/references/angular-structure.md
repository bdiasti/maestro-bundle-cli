# JHipster Angular Structure Reference

## Directory Layout
```
src/main/webapp/app/
  entities/                    # Generated CRUD per entity
    <entity>/
      <entity>.model.ts        # TypeScript interface
      <entity>.routes.ts       # Lazy-loaded routes
      service/<entity>.service.ts
      list/<entity>.component.ts
      detail/<entity>-detail.component.ts
      update/<entity>-update.component.ts
      delete/<entity>-delete-dialog.component.ts
  shared/                      # Shared modules and components
    date/                      # Date utilities
    filter/                    # Filter components
    pagination/                # Pagination components
    sort/                      # Sort directives
  core/                        # Core services
    auth/                      # Authentication
    interceptor/               # HTTP interceptors
    util/                      # Utility services
  layouts/                     # Page layouts
    main/                      # Main layout
    navbar/                    # Navigation bar
    footer/                    # Footer
  config/                      # App configuration
```

## Key Conventions
- All components are `standalone: true`
- Use `SharedModule` for common imports
- Lazy loading for entity routes
- JHipster's `TranslateService` for i18n
- `AlertService` for user notifications
- `SortDirective` and `SortByDirective` for table sorting
- `PaginationComponent` for paginated lists

## Service Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class EntityService {
  private resourceUrl = 'api/entities';

  constructor(private http: HttpClient) {}

  query(req?: any): Observable<HttpResponse<IEntity[]>> {
    const options = createRequestOption(req);
    return this.http.get<IEntity[]>(this.resourceUrl, { params: options, observe: 'response' });
  }
}
```

## Custom Component Best Practices
- Place custom components outside `entities/` to avoid regeneration conflicts
- Mark any changes to generated files with `// CUSTOM` comments
- Use standalone components with explicit imports
- Follow JHipster naming: `jhi-` prefix for entity components
