import {Component, OnInit} from '@angular/core';
import {Course, sortCoursesBySeqNo} from '../model/course';
import {interval, noop, Observable, of, throwError, timer} from 'rxjs';
import {catchError, delay, delayWhen, filter, finalize, map, retryWhen, shareReplay, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {CourseDialogComponent} from '../course-dialog/course-dialog.component';
import { CoursesService } from '../service/courses.service';
import { LoadingService } from '../service/loading.service';
import { MessagesService } from '../service/messages.service';


@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  beginnerCourses$: Observable<Course[]>;
  advancedCourses$: Observable<Course[]>;


  constructor(
    private coursesService: CoursesService, 
    private dialog: MatDialog,
    private loadingService: LoadingService,
    private messagesService: MessagesService) {

  }

  ngOnInit() {
    this.reloadCourses();
  }

  reloadCourses() {
    this.loadingService.loadingOn();
    const courses$ = this.coursesService.loadCourses()
      .pipe(
        map(courses => courses.sort(sortCoursesBySeqNo)),
        catchError(err => {
          const message = 'Could not loade courses';
          this.messagesService.showErrors(message);
          console.log(message, err);
          return throwError(err);
        })
      );
    
    const loadedCourses$ = this.loadingService.showLoaderUntilCompleted(courses$);
    
    this.beginnerCourses$ = loadedCourses$
      .pipe(
        map(courses => courses.filter(course => course.category === 'BEGINNER'))
      );
    this.advancedCourses$ = loadedCourses$
      .pipe(
        map(courses => courses.filter(course => course.category === 'ADVANCED'))
      );
  }

}




