import { Container } from 'inversify';

type Warrior = unknown;

class Ninja {}

const warriorServiceId: symbol = Symbol.for('WarriorServiceId');

// Begin-example
const container: Container = new Container({ defaultScope: 'Singleton' });

// You can configure the scope when declaring bindings:
container.bind<Warrior>(warriorServiceId).to(Ninja).inTransientScope();

// End-example

export { container, Ninja, warriorServiceId };
