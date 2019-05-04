export interface ITimer {
    seconds: number;
    secondsRemaining: number;
    runTimer: boolean;
    hasStarted: boolean;
    hasFinished: boolean;
    displayTime?: string;
}

export interface Sound {
    key: string;
    asset: string;
}
