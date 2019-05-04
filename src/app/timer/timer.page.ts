import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

import * as moment from 'moment';
import { ITimer } from '../services/timer.interface';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.page.html',
  styleUrls: ['./timer.page.scss'],
})
export class TimerPage implements OnInit, AfterViewInit {
  timer: ITimer;
  timeInSeconds = 0;
  percent = 0;
  progress = 0;

  constructor(
    private audioService: AudioService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.initTimer();
  }

  ngAfterViewInit() {
    this.audioService.preloadTimerSound('timer', 'assets/audio/alarm_tick.wav');
    this.audioService.preloadAlertSound('alarm', 'assets/audio/notify.wav');
  }

  initTimer() {
    if (!this.timeInSeconds) {
      this.timeInSeconds = 0;
    }

    this.timer = {
      seconds: this.timeInSeconds,
      runTimer: false,
      hasStarted: false,
      hasFinished: false,
      secondsRemaining: this.timeInSeconds,
    };
    this.timer.displayTime = this.getSecondsAsDigitalClock(this.timer.secondsRemaining);
    this.percent = 0;

    this.audioService.stopTimerSound('timer');
  }

  changeTime(event) {
    const e = moment(event).format('HH:mm:ss');
    const time = e.split(':');
    const secs = (+time[0] * 60 * 60 + (+time[1] * 60) + (+time[2]));
    this.timeInSeconds = secs;

    this.timer = {
      seconds: this.timeInSeconds,
      runTimer: true,
      hasStarted: false,
      hasFinished: false,
      secondsRemaining: this.timeInSeconds,
      displayTime: this.getSecondsAsDigitalClock(this.timeInSeconds)
    };
  }

  startTimer() {
    this.timer.hasStarted = true;
    this.timer.runTimer = true;
    this.timeTicker();
  }

  pauseTimer() {
    this.audioService.stopTimerSound('timer');
    this.timer.runTimer = false;
  }

  resumeTimer() {
    this.startTimer();
  }

  timeTicker() {
    if (this.timer.hasStarted && this.percent > 0) {
      this.audioService.playTimerSound('timer');
    }
    setTimeout(() => {
      if (!this.timer.runTimer) { return; }
      this.timer.secondsRemaining--;
      this.progress = this.timer.secondsRemaining;
      this.percent = Math.floor((this.progress / this.timeInSeconds) * 100) + 1;
      this.percent--;

      this.timer.displayTime = this.getSecondsAsDigitalClock(this.timer.secondsRemaining);
      if (this.timer.secondsRemaining > 0) {
        this.timeTicker();
      } else {
        this.timer.hasFinished = true;
        this.audioService.stopTimerSound('timer');
        this.presentAlert();
      }
    }, 1000);
  }

  getSecondsAsDigitalClock(inputSeconds: number) {
    const secsNumber = parseInt(inputSeconds.toString(), 10);
    const hours = Math.floor(secsNumber / 3600);
    const minutes = Math.floor((secsNumber - (hours * 3600)) / 60);
    const seconds = secsNumber - (hours * 3600) - (minutes * 60);
    let hoursString = '';
    let minutesString = '';
    let secondsString = '';

    hoursString = (hours < 10) ? `0${hours}` : hours.toString();
    minutesString = (minutes < 10) ? `0${minutes}` : minutes.toString();
    secondsString = (seconds < 10) ? `0${seconds}` : seconds.toString();
    return `${hoursString}:${minutesString}:${secondsString}`;
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Notification',
      message: 'Count down timer is complete',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            // stop alert sound
            this.audioService.stopAlertSound('alarm');
          }
        }
      ]
    });
    // play alert sound
    this.audioService.playAlertSound('alarm');
    await alert.present();
  }

}
