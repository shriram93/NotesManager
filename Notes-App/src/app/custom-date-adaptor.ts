import { NativeDateAdapter } from "@angular/material";
import * as moment from 'moment';

export class CustomDateAdapter extends NativeDateAdapter {
    format(date: Date, displayFormat: Object): string {
        moment.locale('en-GB');
        if (displayFormat === 'input') {
            return moment(date).format('DD/MM/YYYY');
        }
        else {
            return moment(date).format('MMM YYYY');
        }
    }
}