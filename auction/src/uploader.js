import React, { Component } from 'react';
import { observer } from "mobx-react"
import { action, decorate } from "mobx"

const Uploader = observer(class Uploader extends Component {
    render() {
      return <>
        <div>
            <p>Upload config here: </p>
            <input type="file" name="config" onChange={this.onUpload} />
        </div>
      </>;
    }

    // decorated action which collects and stores the config upload
    onUpload(event) {
        console.log(event.target.files[0]);
    }
});

decorate(Uploader, {
  onUpload: action
});
export default Uploader;
