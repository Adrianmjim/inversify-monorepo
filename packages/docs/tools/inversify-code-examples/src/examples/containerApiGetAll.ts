import { Container } from 'inversify';

interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  public readonly damage: number = 10;
}

export class Shuriken implements Weapon {
  public readonly damage: number = 5;
}

// Begin-example
const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana);
container.bind<Weapon>('Weapon').to(Shuriken);

const weapons: Weapon[] = container.getAll<Weapon>('Weapon'); // returns Weapon[]
// End-example

export { weapons };
