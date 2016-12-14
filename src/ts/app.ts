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

        this.mode = ko.observable(Mode.select);
        try {
            this.auditorium = new SeatSelector(canv, 30, 45);
        } catch(error) {
            console.log("Wrong context type");
        }
    }
    logJSON(): void {
        const AppJSON = JSON.stringify(this.auditorium.toJSON());
        console.log(AppJSON);
    }
}

ko.applyBindings(new SelectorViewModel(), app);
