import { iydmGenClass } from "../interfaces/iydmGenClass";

class ydmGenClass implements iydmGenClass {
  startDate!: string;
  endDate!: string;
  increment!: number;
  unit!: string;
  format!: string;
  constructor(
    startDate: string,
    endDate: string,
    increment: number,
    unit: string,
    format: string
  ) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.increment = increment;
    this.unit = unit;
    this.format = format;
  }
}

module.exports = ydmGenClass;
