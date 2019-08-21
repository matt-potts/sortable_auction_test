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
    async onUpload(event) {
      if (event && event.target && event.target.files) {
        const fileData = await this.readFileContent(event.target.files[0]);
        console.log(fileData)
      }
    }

    // method example taken and modified from https://blog.shovonhasan.com/using-promises-with-filereader/
    readFileContent(file) {
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onerror = () => {
          reader.abort();
          reject(new DOMException("bad input file."));
        };

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.readAsText(file);
      });
    };
});

decorate(Uploader, {
  onUpload: action.bound
});
export default Uploader;
