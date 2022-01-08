import {Component} from 'react'
import ReactFileReader from 'react-file-reader'
import Cookies from 'js-cookie'
import {Redirect} from 'react-router-dom'
import Loader from 'react-loader-spinner'

import Header from '../Header'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class Home extends Component {
  state = {
    postApiStatus: apiStatusConstants.initial,
    getApiStatus: apiStatusConstants.initial,
    fileName: '',
    uploadData: [],
    fetchedData: [],
  }

  getPostsData = async () => {
    this.setState({getApiStatus: apiStatusConstants.inProgress})
    const apiUrl = 'https://finance-peer-node-js.herokuapp.com/posts'
    const response = await fetch(apiUrl)

    if (response.ok) {
      const data = await response.json()
      this.setState({
        fetchedData: data,
        getApiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({getApiStatus: apiStatusConstants.failure})
    }
  }

  sendingData = async () => {
    this.setState({postApiStatus: apiStatusConstants.inProgress})
    const {uploadData} = this.state
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = 'https://finance-peer-node-js.herokuapp.com/data'

    const options = {
      method: 'POST',
      body: JSON.stringify(uploadData),
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }

    const response = await fetch(apiUrl, options)

    console.log(response)
    if (response.ok) {
      console.log(response.message)
      this.setState({postApiStatus: apiStatusConstants.success})
    } else {
      this.setState({postApiStatus: apiStatusConstants.failure})
    }
  }

  clearData = async () => {
    this.setState({getApiStatus: apiStatusConstants.inProgress})
    const apiUrl = 'https://finance-peer-node-js.herokuapp.com/data'
    const options = {
      method: 'DELETE',
    }

    const response = await fetch(apiUrl, options)

    if (response.ok) {
      console.log()
    }

    console.log(response)
  }

  handleFiles = files => {
    console.log('upload button clicked')
    const {name} = files[0]

    const reader = new FileReader()
    reader.onload = () => {
      const data = JSON.parse(reader.result)
      const modifiedData = data.map(each => ({
        user_id: each.userId,
        id: each.id,
        title: each.title,
        body: each.body,
      }))

      console.log(modifiedData)
      this.setState(
        {fileName: name, uploadData: modifiedData},
        this.sendingData,
      )
    }
    reader.readAsText(files[0])
  }

  renderUploadingFileStatus = () => {
    const {postApiStatus, fileName} = this.state
    switch (postApiStatus) {
      case apiStatusConstants.inProgress:
        return (
          <p className="in-progress">
            Your file <span>${fileName}</span> is uploading...
          </p>
        )
      case apiStatusConstants.success:
        return <p className="success">Uploaded SuccessFully!</p>
      case apiStatusConstants.failure:
        return <p className="failure">Uploading Failed Please Try Again</p>
      default:
        return null
    }
  }

  renderGettingPostStatus = () => {
    const {getApiStatus, fetchedData} = this.state
    switch (getApiStatus) {
      case apiStatusConstants.initial:
        return (
          <div>
            <h4>Click On Below To See output </h4>
            <button type="button" onClick={this.getPostsData}>
              See Data
            </button>
          </div>
        )
      case apiStatusConstants.inProgress:
        return (
          <div className="react-loader-spinner">
            <Loader height="50" width="50" color="blue" type="ThreeDots" />
          </div>
        )
      case apiStatusConstants.success:
        return (
          <div>
            {fetchedData.length > 0 ? (
              <ul>
                {fetchedData.map(each => (
                  <li key={each.id}>
                    <h3>{each.title}</h3>
                    <p>{each.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No Posts are there Please upload a file to see posts</p>
            )}

            <button type="button" onClick={this.clearData}>
              Clear
            </button>
          </div>
        )
      case apiStatusConstants.failure:
        return <p>Fetching Failed Please Try Again</p>
      default:
        return null
    }
  }

  render() {
    const accessToken = Cookies.get('jwt_token')

    if (accessToken === undefined) {
      return <Redirect to="/login" />
    }

    return (
      <>
        <Header />
        <div className="home-container">
          <div className="home-content">
            <h1 className="home-heading">JSON File Uploader</h1>
            <img
              src="https://icon-library.com/images/file-upload-icon/file-upload-icon-22.jpg"
              className="home-mobile-img"
              alt="file upload"
            />
            <p className="home-description">
              Click On Upload button To upload JSON File and See the Output.
            </p>
            <div className="react-file-reader-container">
              <ReactFileReader handleFiles={this.handleFiles}>
                <button type="button" className="upload-button">
                  Upload
                </button>
              </ReactFileReader>
            </div>
            {this.renderUploadingFileStatus()}
          </div>
          <img
            src="https://icon-library.com/images/file-upload-icon/file-upload-icon-22.jpg"
            alt="file upload"
            className="home-desktop-img"
          />
        </div>
        <div className="result-container">{this.renderGettingPostStatus()}</div>
      </>
    )
  }
}

export default Home
