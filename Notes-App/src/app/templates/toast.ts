export class Toast {
    status: string;
    message: string;
    type: string;
    data: any;
    constructor() {
        this.status = 'reset';
        this.message = '';
        this.type = '';
        this.data = '';
    }
}

