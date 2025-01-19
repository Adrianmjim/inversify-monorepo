// Is-inversify-import-example
import { Container, inject, injectable, interfaces, named } from 'inversify';

interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  public readonly damage: number = 10;
}

export class Shuriken implements Weapon {
  public readonly damage: number = 5;
}

const container: Container = new Container();

// Begin-example
const ninjaId: symbol = Symbol.for('Ninja');
const weaponId: symbol = Symbol.for('Weapon');

@injectable()
class Ninja {
  constructor(
    @inject(weaponId)
    @named('shuriken')
    public readonly weapon: Weapon,
  ) {}
}

container.bind<Ninja>(ninjaId).to(Ninja);

const whenTargetNamedConstraint: (
  name: string,
) => (request: interfaces.Request) => boolean =
  (name: string) =>
  (request: interfaces.Request): boolean =>
    request.target.matchesNamedTag(name);

container
  .bind<Weapon>(weaponId)
  .to(Katana)
  .when(whenTargetNamedConstraint('katana'));

container
  .bind<Weapon>(weaponId)
  .to(Shuriken)
  .when(whenTargetNamedConstraint('shuriken'));

const ninja: Ninja = container.get(ninjaId);

// Returns 5
const ninjaDamage: number = ninja.weapon.damage;
// End-example

export { ninjaDamage };
