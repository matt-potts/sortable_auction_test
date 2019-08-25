import React, { Component } from 'react';
import { observer } from "mobx-react"
import { action, decorate } from "mobx"
import PropTypes from 'prop-types';

// This component is used to upload a json file and pass results up through the included function prop
const Uploader = observer(class Uploader extends Component {
  static propTypes = {
    saveFileContent: PropTypes.func.isRequired
  }

  render() {
    return <div className="custom-file">
      <input className="custom-file-input pointer" type="file" id="configLoader" name="configLoader" onChange={this.onUpload} />
      <label className="custom-file-label" htmlFor="configLoader">Choose file</label>
    </div>;
  }

  // decorated action which collects and stores the config upload
  async onUpload(event) {
    if (event && event.target && event.target.files) {
      try {
        const fileContent = await this.readFileContent(event.target.files[0]);
        const content = JSON.parse(fileContent);
        this.props.saveFileContent(content);
      } catch (e) {
        // error
        console.log('error', e);
      }
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
