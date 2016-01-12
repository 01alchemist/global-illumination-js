/**
 * Created by Nidin Vinayakan on 09-01-2016.
 */
export class Attenuation {


    constructor(public constant:number=1, public linear:number=0, public quadratic:number=0) {

    }

    static fromJson(attenuation:Attenuation):Attenuation {
        return new Attenuation(
            attenuation.constant,
            attenuation.linear,
            attenuation.quadratic
        );
    }

    compute(d:number):number {
        return 1 / (this.constant + this.linear * d + this.quadratic * d * d);
    }

    set(attenation:Attenuation):Attenuation {
        this.constant = attenation.constant;
        this.linear = attenation.linear;
        this.quadratic = attenation.quadratic;
        return this;
    }
}

export const NoAttenuation:Attenuation = new Attenuation(1, 0, 0);

export class LinearAttenuation extends Attenuation {

    constructor(value:number) {
        super(1, value, 0);
    }
}
export class QuadraticAttenuation extends Attenuation {

    constructor(value:number) {
        super(1, 0, value);
    }
}
