import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import * as AceDiff from 'ace-diff';


@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {

  aceDiffConstructorOpts: AceDiff;
  data: any;

  constructor(private dialogRef: MatDialogRef<ModalComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    this.data = data;
    console.log("DAAATA MODALLL", data)
  }

  ngOnInit() {
    this.aceDiffConstructorOpts = new AceDiff( {
      element: '.acediff',
      mode: 'ace/mode/java',
      theme: null,
      diffGranularity: 'broad',
      showDiffs: true,
      showConnectors: true,
      left: {content: 'INSTRUCTOR CODE', editable: false},
      right: { content: 'YOUR CODE', editable:false },
      classes: {
        diff: 'acediff__diffLine',
        connector: 'acediff__connector',
        newCodeConnectorLinkContent: '&#8594;',
        deletedCodeConnectorLinkContent: '&#8592;',
      }
    });

    var editors =  this.aceDiffConstructorOpts.getEditors();
    editors.left.setValue(this.data.userCode, 1);
    editors.right.setValue(this.data.externalCode, 1);
  }

  

  close(): void {
    this.dialogRef.close();
  }

}
