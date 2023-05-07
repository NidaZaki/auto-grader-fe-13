import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import * as ace from 'ace-builds'; // ace module ..
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';
import { AutograderService } from 'src/autograder-service/autograder.service';
import { CodeResponse, TestCaseGrouped, TestCaseList } from 'src/models/code-response.model';
import { InstructorCode } from 'src/models/instructor-code.model';
import { SplitComponent} from 'angular-split';
import { Subscription } from 'rxjs';
import * as AceDiff from 'ace-diff'; 
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import { ModalComponent } from './modal/modal.component';
import { SocialAuthService } from "@abacritt/angularx-social-login";
import { SocialUser } from "@abacritt/angularx-social-login";
import { GoogleResponse } from 'src/models/google.model';
import { UserService } from 'src/user-service/userservice.service';
import { Router } from '@angular/router';
import * as ClassicEditor from '../app/ckeditorCustomBuild/build/ckeditor'
import { StudentSubmission } from 'src/models/student-submission.model';
import { UserRole } from 'src/models/user-role.model';
import { FormControl } from '@angular/forms';
import moment from 'moment';
import { StudentCodeResponse } from 'src/models/student-code-response.model';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

const THEME = 'ace/theme/dracula'; 
const LANG = 'ace/mode/java';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('myEditor') myEditor: any;
  @ViewChild('codeEditorTest',{ static: false }) codeEditorTestElmRef: ElementRef;
  @ViewChild('codeEditor', { static: false }) codeEditorElmRef: ElementRef;
  @ViewChild('mySplitA') mySplitAEl: SplitComponent;
  @ViewChild('editorContainer', { static: false }) editorContainer: ElementRef;
  @ViewChild('loginRef', {static: true }) loginElement: ElementRef;
  
  selectedLanguage = 'Java';
  private codeEditor: ace.Ace.Editor;
  private codeEditorTest: ace.Ace.Editor;
  testCasesContainerHeight: number;
 
  opened: boolean;
  fileName = 'Operations';
  extOfTestFileName='Test.java'
  extOfFileName = '.java';
  fileNameEdit: boolean;
  progressBarNum = 0;
  themes = [
    {label: 'Twilight', value: 'twilight'},
    {label: 'Vibrant Ink', value: 'vibrant_ink'},
    {label: 'Dracula', value: 'dracula'},
    {value: 'tomorrow_night_blue', label: 'Tomorrow Night Blue'},
	  {value: 'tomorrow_night_bright', label: 'Tomorrow Night Bright'},
	  {value: 'tomorrow_night_eighties' , label: 'Tomorrow Night 80s'}
  ]

  selectedTheme = 'dracula';
  instructorViewBoolean = true;
  testCaseSplitSize = 30;
  code: string = '';
  testCode : string = '';
  codeResponse: CodeResponse;
  content: string;
  studentCodeResponse: StudentCodeResponse;
  testResult: TestCaseList;
  testGroup: TestCaseGrouped;
  testCaseResult: TestCaseList[] = [];
  sub: Subscription;
  isResultContainerVisible: boolean;
  aceDiffConstructorOpts: AceDiff;
  sideNavContainer: boolean ; 
  methodListSideNav: boolean;
  description:string;
  user: SocialUser;
  loggedIn: boolean;
  googleCred: GoogleResponse;
  auth2: any;
  signedInUser:any;
  isUserSignedIn:boolean;
  profileImg: string;
  decodedToken: any;
  signOutProgress: boolean;
  compileProgress: boolean;
  diffEditorButton : boolean;
  userId : string;      // email
  studentSubmission: StudentSubmission[] = [];
  submissionView = false;
  score: number;
  public editor: any = ClassicEditor;
  displayedColumns: string[] = ['userId', 'grade', 'code', 'date'];
  isVisible: boolean = true;
  userRole: UserRole[];
  initialVisibility: boolean = true;
  deadline: string;
  formatedDeadlineDate: string;
  resultDateAfterComparing: boolean;
  submittedStatus = false;
  dataSourceNew = new MatTableDataSource<StudentSubmission>();
  private sort: MatSort;

  constructor(private autograderService: AutograderService, 
    public router: Router, 
    private changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog, private authService: SocialAuthService,
    private userService: UserService, private ref : ChangeDetectorRef, private el: ElementRef) {

    this.instructorViewBoolean = true;

    this.isUserSignedIn = this.userService.isUserSignedIn();
    (window as any).handleCredentialResponse = (response: any) => {
        // Decoding  JWT token...
          //this.decodedToken: any | null = null;
          try {
            this.decodedToken = JSON.parse(atob(response?.credential.split('.')[1]));
            this.userService.signIn(this.decodedToken);
            this.signedInUser = this.decodedToken;
            this.profileImg = this.signedInUser['picture']
            this.userId = this.signedInUser['email']
            this.opened = false;
            this.setSignIn();
            this.getUserRoles();
          } catch (e) {
            console.error('Error while trying to decode token', e);
          }
          console.log('decodedToken', this.decodedToken.email);
    }

    this.getStudentSubmission();
  }

  setSignIn() {
    this.isUserSignedIn = this.userService.isUserSignedIn();
    this.changeDetectorRef.detectChanges();
  }

  public config = {
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'bulletedList',
        'numberedList',
        'imageUpload',
        'blockQuote',
        'codeBlock'
      ]
    }
  };
 
  selectDate(date: any){
    this.formatedDeadlineDate = moment(date.value).format("MM.DD.YYYY HH:mm");
  }

  deadlineDate = new FormControl(new Date());

  ngOnInit () {
    ace.require("ace/ext/language_tools");
      this.changeDetectorRef.detectChanges();

      const element = this.codeEditorElmRef.nativeElement;
      const editorOptions = this.getEditorOptions();
      ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');
      this.codeEditor = ace.edit(element, editorOptions);
      this.codeEditor.setScrollSpeed(.5);
      this.codeEditor.getSession().setUseWrapMode(true);
      this.codeEditor.container.style.lineHeight = '1.5';
      this.codeEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
      });
   
      if(this.instructorViewBoolean) {
        this.getInstructorCode();
      }

      if (this.isUserSignedIn) {
        this.profileImg = this.userService.getUserImage();
      }
  }

  signInHandler() {
    console.log('Signed In');
    this.opened = false;
  }

  signOut(){
    this.initialVisibility = true;
    this.opened = false;
    this.userService.signOut();
    this.isUserSignedIn = this.userService.isUserSignedIn();
    //this.changeDetectorRef.detectChanges();
    this.signOutProgress = true;
    setTimeout(() => {
      this.signOutProgress = false;
      window.location.reload()
    }, 1200)
    //document.getElementById('credential_picker_container').style.display = 'none';
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.id = 'modal-component';
    dialogConfig.data =  {userCode: this.code, externalCode: this.codeResponse?.instructorCode};
    dialogConfig.disableClose = true;
    dialogConfig.height = "600px";
    dialogConfig.width = "1000px";
    const dialogRef = this.dialog.open(ModalComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        data => console.log("Dialog output:", data)
    );     
  }

  viewCode(studentCode: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.id = 'modal-component';
    dialogConfig.data =  {userCode: studentCode, externalCode: this.codeResponse?.instructorCode};
    console.log(studentCode)
    dialogConfig.disableClose = true;
    dialogConfig.height = "600px";
    dialogConfig.width = "1000px";
    const dialogRef = this.dialog.open(ModalComponent, dialogConfig);    
  }
 
  private getTextEditorContent() {
    if (this.myEditor && this.myEditor.editorInstance) {
      this.content = this.myEditor.editorInstance.getData();
    }
    return this.content;
  }

  private getInstructorCode() {
    this.autograderService.getInstructorCode().subscribe({
      next: (resp: InstructorCode) => {
        this.code = resp.code;
        this.testCode = resp.testCode;
        this.description = resp.description;
        this.initCodeEditor();
        this.initTestCodeEditor();
        this.changeDetectorRef.detectChanges();
        this.myEditor.editorInstance.setData(resp.description);
      },
      error: (e: any) => console.error(e),
      complete: () => console.info('complete')
    });
  }

  private initCodeEditor() {
    const element = this.codeEditorElmRef.nativeElement;
    const editorOptions = this.getEditorOptions();
    ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');
    this.codeEditor = ace.edit(element, editorOptions);
    this.codeEditor.setTheme(THEME);
    this.codeEditor.getSession().setMode(LANG);
    this.codeEditor.setShowFoldWidgets(true);
    this.codeEditor.container.style.lineHeight = '1.5';
    setTimeout(() => {
      this.codeEditor.getSession().setValue(this.code)
      this.changeDetectorRef.detectChanges();
      this.progressBarNum = 100;
    } , 1000);
  }

  initTestCodeEditor() {
    const elementTest = this.codeEditorTestElmRef.nativeElement;
    const editorOptionsTest = this.getEditorOptions();
    ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');
    this.codeEditorTest = ace.edit(elementTest, editorOptionsTest);
    this.codeEditorTest.setTheme(THEME);
    this.codeEditorTest.getSession().setMode(LANG);
    this.codeEditorTest.setShowFoldWidgets(true);
    this.codeEditorTest.container.style.lineHeight = '1.5';
    setTimeout(() => {
      this.codeEditorTest.getSession().setValue(this.testCode)
      this.changeDetectorRef.detectChanges();
      this.progressBarNum = 100;
    } , 1200);
  }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    this.dataSourceNew.sort = this.sort;
  }
  
  getStudentSubmission(){
    this.autograderService.getStudentSubmission().subscribe({
      next: (resp: StudentSubmission[]) => {
        this.studentSubmission = resp;
        console.log(resp)
        this.changeDetectorRef.detectChanges();
      },
      error: (e: any) => console.error(e),
      complete: () => {
        this.dataSourceNew.data = this.studentSubmission;
        console.log("DATAAA", this.dataSourceNew.data)
        console.info('complete')
     
      }
     
    });
  }

  ngAfterViewInit(): void { 
      this.codeEditor.on("change", () => {
          this.code = this.codeEditor.getValue();
      });
    
      // if(this.instructorViewBoolean){
        this.codeEditorTest.on("change", () => {
          this.testCode = this.codeEditorTest.getValue();
        });
      // }
     
  }

  ngAfterContentInit(): void {
      const elementTest = this.codeEditorTestElmRef.nativeElement;
      const editorOptionsTest = this.getEditorOptions();
      ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');
      this.codeEditorTest = ace.edit(elementTest, editorOptionsTest);
  }

  submitCode(){
    if (this.instructorViewBoolean === false) {
      const file = new File([this.code], this.fileName+this.extOfFileName,{type: ".java"});
      const formData = new FormData();
      formData.set('file', file);
      formData.set('userId', this.userId);
      formData.set('studentCode', this.code)
      this.isResultContainerVisible = true;
      this.compileProgress = true;
      this.autograderService.testJavaFile(formData).subscribe({
        next: (resp) => { 
          this.compileProgress = false;
          this.codeResponse = new CodeResponse();
          if (resp) {
            this.codeResponse = resp; 
            this.changeDetectorRef.detectChanges();
            this.testCaseResult = [...this.codeResponse.testCaseGrouped[0].testCaseList];
            this.testGroup = this.codeResponse.testCaseGrouped[0];
            this.testResult = this.codeResponse.testCaseGrouped[0].testCaseList[0];
            this.testCaseSplitSize = 60;
            this.submittedStatus = true;
            this.changeDetectorRef.detectChanges();
          }},
        error: (e) => {
          console.error(e);
        },
        complete: () => {
          if(this.codeResponse.status === 'SUCCESS'){
            this.diffEditorButton = true;
          }
          this.getStudentSubmission();
         }
      });

    } 
    else {
      this.description = this.getTextEditorContent();
      const file = new File([this.code], this.fileName+this.extOfFileName,{type: ".java"});
      const testFile = new File([this.testCode], this.fileName+this.extOfTestFileName,{type: ".java"});
      const formData = new FormData();
      formData.set('file', file);
      formData.set('testFile', testFile);
      formData.set('description', this.description);
      formData.set('deadline', this.formatedDeadlineDate);
      this.isResultContainerVisible = true;
      this.compileProgress = true;
      this.autograderService.createJavaFile(formData).subscribe({
        next: (resp) => { 
          console.log(resp); 
          this.codeResponse = resp; 
          this.changeDetectorRef.detectChanges();
          this.testCaseResult = [...this.codeResponse.testCaseGrouped[0].testCaseList];
          this.testGroup = this.codeResponse.testCaseGrouped[0];
          this.testResult = this.codeResponse.testCaseGrouped[0].testCaseList[0];
          console.log('API', this.testCaseResult);
          this.testCaseSplitSize = 60;
          this.changeDetectorRef.detectChanges();
          this.compileProgress = false;
        },
        error: (e) => console.error(e),
        complete: () => {
          console.info('complete')  
        }
      })
    }
  }

  getFunctionList() {         // student view
    this.instructorViewBoolean = false;
    this.diffEditorButton = false;
    this.submissionView = false;
    this.progressBarNum = 0;
    this.codeResponse = new CodeResponse();
    this.testCaseResult = [];
    this.testResult = null;
    this.code = '';
    this.changeDetectorRef.detectChanges()
    this.autograderService.getFunctionList().subscribe(
      response => { 
      if (response){
        this.studentCodeResponse = response; 
        this.deadline = response.deadline;
        this.changeDetectorRef.detectChanges()
        this.content = response.description;
        let presetCode = "public class " + this.fileName + " { \n \n ";
        presetCode = presetCode + response.functionsList.map(e => '\t' + e + ' {' + '\n\n' + '\t }\n\n').join("") + "}";
        this.code = presetCode;
        this.initCodeEditor();
        this.changeDetectorRef.detectChanges()
      } 
    })
  }

  // missing propery on EditorOptions 'enableBasicAutocompletion' so this is a wolkaround still using ts
  private getEditorOptions(): Partial<ace.Ace.EditorOptions> & { enableBasicAutocompletion?: boolean; } {
      const basicEditorOptions: Partial<ace.Ace.EditorOptions> = {
          highlightActiveLine: true,
          minLines: 35,
          fontSize: 14,
          maxLines: Infinity,
          autoScrollEditorIntoView: true,
          vScrollBarAlwaysVisible: false,
          wrap: false,
          scrollPastEnd: false,
      };

      const extraEditorOptions = {
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
      };
      const margedOptions = Object.assign(basicEditorOptions, extraEditorOptions);
      return margedOptions;
  }

  themeHandler(event: Event) {
    this.codeEditor.setTheme(`ace/theme/${this.selectedTheme}`);
    this.codeEditorTest.setTheme(`ace/theme/${this.selectedTheme}`);
  } 

  instructorView(){
    this.instructorViewBoolean = true;
    this.submissionView = false;
    this.progressBarNum = 0;
    this.changeDetectorRef.detectChanges();
    this.initTestCodeEditor();
    this.getInstructorCode();
    this.changeDetectorRef.detectChanges();
    this.codeResponse = new CodeResponse();
    this.testCaseResult = [];
    this.testResult = null;
  }
  
  getUserRoles(){
    this.autograderService.getUserRoles().subscribe({
      next: (resp: UserRole[]) => {
        this.userRole = resp;
        for (let index = 0; index < this.userRole.length; index++) {
          if(this.userRole[index].userName === this.userId && this.userRole[index].role === 'instructor'){
            this.isVisible = true;
            this.initialVisibility = false;
            console.log("Instructor", this.isVisible)
          }
          else if(this.userRole[index].userName === this.userId && this.userRole[index].role === 'student'){
              this.isVisible = false;
              this.initialVisibility = false;
              this.getFunctionList()
              console.log("Student", this.isVisible)
          }
        }
      
      },
      error: (e: any) => console.error(e),
      complete: () => console.info('complete')
    });
  }

  updateFileName() {
    this.fileNameEdit = true;
  }

  saveFileName(fileName: any){
    this.fileName = fileName;
    this.fileNameEdit = false;
  }

  selectTestGroup(testCaseList: TestCaseList[], testCaseGroup: TestCaseGrouped) {
      this.testCaseResult = testCaseList;   // []
      this.testGroup = testCaseGroup;   // subtract, addition,....
      this.testResult = this.testCaseResult[0];
      console.log(this.testCaseResult)
  }

  selectTestNumber(testCase: TestCaseList){
    this.testResult = testCase;
    console.log(this.testResult)
  }

  toggleConsole(){
    this.isResultContainerVisible = !this.isResultContainerVisible;
  }

  clickSubmissionButton(){
    this.submissionView = true;
    this.changeDetectorRef.detectChanges();
    this.getStudentSubmission();
    this.changeDetectorRef.detectChanges();
  }
}


