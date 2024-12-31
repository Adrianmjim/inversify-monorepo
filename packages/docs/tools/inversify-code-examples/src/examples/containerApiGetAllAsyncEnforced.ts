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
container
  .bind<Weapon>('Weapon')
  .toDynamicValue(async () => new Katana())
  .when(() => true);
container
  .bind<Weapon>('Weapon')
  .to(Shuriken)
  .when(() => false);

// returns [new Katana(), new Shuriken()]
const allWeapons: Promise<Weapon[]> = container.getAllAsync<Weapon>('Weapon');

// returns [new Katana()]
const notAllWeapons: Promise<Weapon[]> = container.getAllAsync<Weapon>(
  'Weapon',
  {
    enforceBindingConstraints: true,
  },
);
// End-example

export { allWeapons, notAllWeapons };
