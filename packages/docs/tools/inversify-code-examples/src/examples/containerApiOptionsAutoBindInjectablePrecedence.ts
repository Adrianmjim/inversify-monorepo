import { Container } from 'inversify';

export class Ninja {}

export class NinjaMaster extends Ninja {}

// Begin-example
const container: Container = new Container({ autoBindInjectable: true });

// returns a Ninja
container.bind(Ninja).to(NinjaMaster);
// returns NinjaMaster
container.get(Ninja);
// End-example

export { container };
