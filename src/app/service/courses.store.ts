import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, map, shareReplay, tap } from "rxjs/operators";
import { Course, sortCoursesBySeqNo } from "../model/course";
import { LoadingService } from "./loading.service";
import { MessagesService } from "./messages.service";

@Injectable({
    providedIn: 'root'
})
export class CoursesStore {

    private subject = new BehaviorSubject<Course[]>([]);
    courses$: Observable<Course[]> = this.subject.asObservable();

    constructor(
        private http: HttpClient,
        private loading: LoadingService,
        private messagesService: MessagesService
    ) {
        this.loadAllCourses();
    }

    private loadAllCourses() {
        const loadCourses$ = this.http.get<Course[]>('/api/courses')
            .pipe(
                map(response => response['payload']),
                catchError(err => {
                    const message = 'Could not to load courses';
                    this.messagesService.showErrors(message);
                    return throwError(err);
                }),
                tap(courses => this.subject.next(courses))
            )
        this.loading.showLoaderUntilCompleted(loadCourses$)
                .subscribe()
    }

    saveCourse(courseId: string, changes: Partial<Course>): Observable<any> {
        const courses = this.subject.getValue();
        const index = courses.findIndex(course => course.id === courseId);
        const newCourse: Course = {
            ...courses[index],
            ...changes
        };
        const newCourses: Course[] = courses.slice(0);
        newCourses[index] = newCourse;
        this.subject.next(newCourses);
        return this.http.put(`/api/courses/${courseId}`, changes)
            .pipe(
                catchError(err => {
                    const message = 'Could not to load courses';
                    this.messagesService.showErrors(message);
                    return throwError(err);
                }),
                shareReplay()
            )
    }

    filterByCategory(category: string) {
        return this.courses$
            .pipe(
                map(courses => courses.filter(course => course.category === category).sort(sortCoursesBySeqNo))
            )
    }

}