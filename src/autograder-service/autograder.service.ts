import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { backendUrl } from '../../src/environment';
import { CodeResponse } from 'src/models/code-response.model';
import { InstructorCode } from 'src/models/instructor-code.model';
import { StudentSubmission } from 'src/models/student-submission.model';
import { UserRole } from 'src/models/user-role.model';
import { StudentCodeResponse } from 'src/models/student-code-response.model';

@Injectable({
  providedIn: 'root'
})
export class AutograderService {

  url = backendUrl.concat('instructor');

  constructor(private http: HttpClient) { }

  createJavaFile(formData: FormData): Observable<CodeResponse> {
    // Send the Java file content to the API endpoint as a POST request

    return this.http.post<CodeResponse>(this.url, formData).pipe(
        map((response: CodeResponse) => response)
    );

  }

  //submit

  testJavaFile(formData: FormData): Observable<CodeResponse> {
    // Send the Java file content to the API endpoint as a POST request

    return this.http.post<CodeResponse>(this.url+'/submit', formData).pipe(
      map((response: CodeResponse) => response as CodeResponse)
    );
  }

  getFunctionList(): Observable<StudentCodeResponse>{
    return this.http.get<StudentCodeResponse>(this.url);
  }

  getInstructorCode(): Observable<InstructorCode> {
     return this.http.get<InstructorCode>(this.url+'/code');
  }

 getStudentSubmission(): Observable<StudentSubmission[]> {
  return this.http.get<StudentSubmission[]>(this.url+'/studentsubmission');
  }

  getUserRoles(): Observable<UserRole[]> {
  return this.http.get<UserRole[]>(this.url+'/role');
  }

}
