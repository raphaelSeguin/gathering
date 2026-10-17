export abstract class AggragateRoot<DomainEvent> {
  private domainEvents: DomainEvent[] = []

  protected record(event: DomainEvent): void {
    this.domainEvents.push(event)
  }

  pullDomainEvents(): DomainEvent[] {
    const events = this.domainEvents
    this.domainEvents = []
    return events
  }
}


