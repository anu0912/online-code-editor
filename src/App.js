import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Axios from 'axios';

class App extends Component {

  constructor() {
    super();
    this.state = {
      languages: [],
      output_data: [],
      judgeO_api_key: 'ba5b4b9ac1msh9c14d0efeddf085p1abc63jsnaba234702d6e'
    };
  };

  // Get Languages from Judge0 API
  componentDidMount() {
    var config = {
      headers: {
        "x-rapidapi-host": "judge0.p.rapidapi.com",
        "x-rapidapi-key": this.state.judgeO_api_key
      }
    };

    // Get Request to Judge0 for getting List of Languages available
    Axios.get("https://judge0.p.rapidapi.com/languages", config)
      .then(response => {
        this.setState({ languages: response.data });
      })
  }

  // Function to Submit code to Judge0
  handleSubmit(event) {
    event.preventDefault();
    const request = JSON.stringify({
      language_id: this.id,
      source_code: this.code,
      stdin: this.stdinputs
    });
    console.log(request);
    // Post Request to Judge0 API for processing the code
    fetch("https://judge0.p.rapidapi.com/submissions", {
      "mode": "cors",
      "method": "POST",
      "headers": {
        "x-rapidapi-host": "judge0.p.rapidapi.com",
        "x-rapidapi-key": this.state.judgeO_api_key,
        "content-type": "application/json",
        "accept": "application/json"
      },
      "body": request
    })
      .then(response => response.json())
      .then(json => {
        console.log(json)
        var submit_token = json.token;
        this.checkStatus(submit_token);
      });
  }

  // Function to check status of submitted code
  checkStatus(submit_token) {
    var config = {
      headers: {
        "x-rapidapi-host": "judge0.p.rapidapi.com",
        "x-rapidapi-key": this.state.judgeO_api_key
      }
    };
    // Get Request to check status of the submitted code
    Axios.get(`https://judge0.p.rapidapi.com/submissions/${submit_token}`, config)
      .then(response => {
        console.log(response.data);
        let id = response.data.status.id;
        if (id <= 2) {
          console.log('those bitches queued again, dispatching again in 1s');
          setTimeout(() => {
            this.checkStatus(submit_token);
          }, 1000)
        }
        else if (id >= 3) {
          console.log(response);
          this.setState({ output_data: response.data });
          console.log(this.state.output_data);
        }
      });
  }

  // UI
  render() {
    let languages = this.state.languages;
    let output = this.state.output_data;

    let options = languages.map((language) =>
      <option key={language.id} value={language.id}>{language.name}</option>
    );

    var stdout;

    if (output != null) {
      if(output.stdout!=null){
        stdout = output.stdout;
      } else if(output.stderr!=null){
        stdout = output.stderr;
      } else if(output.compile_output != null){
        stdout = output.compile_output;
      }
    }

    return (
      <React.Fragment>
        {/* Navigation Bar */}
        <nav className="navbar navbar-expand-sm bg-info navbar-dark px-sm-5">
          <ul className="navbar-nav align-items-center" >
            <li className="nav-item">Online Ide</li>
            <li className="nav-item ml-5">
              <select onChange={(event) => { this.id = event.target.value }}>
                {options}
              </select>
            </li>
          </ul>
          <button className="ml-auto btn btn-success" onClick={this.handleSubmit.bind(this)}>Run</button>
        </nav>
        {/* Code Area */}
        <div className="py-3 ml-5">
          <div className="row">
            <div className="col-md-8 col-lg-6 B">
              <div className="card card-inverse card-primary">
                <h3>Code Area</h3>
                <div className="form-group">
                  <textarea className="form-control rounded-1" id="exampleFormControlTextarea1" rows="30" placeholder="// type some code..." onChange={(event => this.code = event.target.value)}></textarea>
                </div>
              </div>
            </div>
            {/* STDIN */}
            <div className="col-md-4 col-lg-6 G">
              <div className="row h-100">
                <div className="col-md-12 h-25">
                  <div className="card card-inverse card-primary h-100">
                    <h2>STDIN</h2>
                    <div className="form-group container">
                      <textarea className="form-control rounded-0" id="exampleFormControlTextarea1" rows="10" placeholder="// enter input values..." onChange={(event => this.stdinputs = event.target.value)}></textarea>
                    </div>
                  </div>
                </div>
                {/* STDOUT */}
                <div className="col-md-12 h-30">
                  <div className="card card-inverse card-primary h-100">
                    <div className="container">
                      <h2>STDOUT</h2>
                      <b>{stdout}</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };
}

export default App;
