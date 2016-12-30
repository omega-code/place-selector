import ko = require('knockout');
import { SeatSelector, Mode } from './SeatSelector';

const app = document.getElementById("app");

class SelectorViewModel {
    auditorium: SeatSelector;
    mode: KnockoutObservable<Mode>;

    constructor() {
        const canv = document.getElementsByTagName("canvas")[0];
        canv.width = document.body.clientWidth * 0.98;
        canv.height = window.innerHeight * 0.7;
        canv.addEventListener('wheel', this.onWheel.bind(this));
        this.mode = ko.observable(Mode.Select);
        try {
            this.auditorium = new SeatSelector(canv, 30, 45);
        } catch(error) {
            console.log("Wrong context type");
        }
    }

    onWheel(event: WheelEvent) {
        if(event.deltaY > 0) this.auditorium.scaleDown();
        else this.auditorium.scaleUp();
    }

    logJSON(): void {
        const AppJSON = JSON.stringify(this.auditorium.toJSON());
        console.log(AppJSON);
    }
}

ko.applyBindings(new SelectorViewModel(), app);
