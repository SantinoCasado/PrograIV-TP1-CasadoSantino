import { Component, Input, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timer-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timer-bar.component.html',
  styleUrls: ['./timer-bar.component.css']
})
export class TimerBarComponent implements OnDestroy {
  @Input() duracion: number = 15; // segundos
  @Input() autoStart: boolean = true;
  @Output() sinTiempo = new EventEmitter<void>();
  @Output() tick = new EventEmitter<number>();

  timeLeft: number = 0;
  intervalId: any;
  running = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.timeLeft = this.duracion;
    if (this.autoStart) {
      this.iniciar();
    }
  }

  iniciar() {
    this.detener();
    this.timeLeft = this.duracion;
    this.running = true;
    this.intervalId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.tick.emit(this.timeLeft);
        this.cdr.markForCheck();
      }
      if (this.timeLeft <= 0) {
        this.sinTiempo.emit();
        this.detener();
      }
    }, 1000);
  }

  detener() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.running = false;
  }

  reiniciar() {
    this.iniciar();
  }

  ngOnDestroy() {
    this.detener();
  }
}
