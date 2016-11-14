import { SeatSelector } from './SeatSelector';

const canv = document.createElement("canvas");
document.body.appendChild(canv);
canv.width = document.body.clientWidth;
canv.height = window.innerHeight * 0.7;
canv.style.margin = "20px";

const auditorium = new SeatSelector(canv, 30, 45);
auditorium.renderInfo();
