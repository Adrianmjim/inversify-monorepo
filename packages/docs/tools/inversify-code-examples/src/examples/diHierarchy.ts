import { Container } from 'inversify';

const weaponIdentifier: symbol = Symbol.for('Weapon');

// Begin-example
class Katana {}

const parentContainer: Container = new Container();
parentContainer.bind(weaponIdentifier).to(Katana);

const childContainer: Container = parentContainer.createChild();

const katana: Katana = childContainer.get(weaponIdentifier);
// End-example

export { Katana, katana };
