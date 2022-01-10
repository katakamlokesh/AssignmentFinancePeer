import {Component} from 'react'
import ReactFileReader from 'react-file-reader'
import Cookies from 'js-cookie'
import {Redirect} from 'react-router-dom'
import Loader from 'react-loader-spinner'

import Header from '../Header'
import PostCard from '../PostCard'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
  cleared: 'CLEARED',
}

class Home extends Component {
  state = {
    postApiStatus: apiStatusConstants.initial,
    getApiStatus: apiStatusConstants.initial,
    fileName: '',
    uploadData: [],
    fetchedData: [],
  }

  componentDidMount() {
    this.getPostsData()
  }

  getPostsData = async () => {
    this.setState({
      getApiStatus: apiStatusConstants.inProgress,
      postApiStatus: apiStatusConstants.initial,
    })
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

    if (response.ok) {
      console.log(response.message)
      this.setState(
        {postApiStatus: apiStatusConstants.success},
        this.getPostsData,
      )
    } else {
      this.setState({postApiStatus: apiStatusConstants.failure})
    }
  }

  clearData = async () => {
    console.log('clear data clicked')
    this.setState({getApiStatus: apiStatusConstants.inProgress})
    const apiUrl = 'https://finance-peer-node-js.herokuapp.com/data'
    const options = {
      method: 'DELETE',
    }

    const response = await fetch(apiUrl, options)

    if (response.ok) {
      this.setState({getApiStatus: apiStatusConstants.cleared})
    }
  }

  handleFiles = files => {
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
      this.setState(
        {fileName: name, uploadData: modifiedData},
        this.sendingData,
      )
    }
    reader.readAsText(files[0])
  }

  renderPostsSuccess = () => {
    const {fetchedData} = this.state

    return fetchedData.length > 0 ? (
      <div>
        <h1 className="output-heading">Uploaded Data</h1>
        <p className="total-posts">
          Total Posts:{' '}
          <span className="total-posts-span">{fetchedData.length}</span>
        </p>
        <ul className="posts-container">
          {fetchedData.map(each => (
            <PostCard key={each.id} postDetails={each} />
          ))}
        </ul>
        <hr className="middle-line" />
        <div className="clear-container">
          <p className="home-description">
            To Clear (or) Delete Data in The Db Click On Clear button
          </p>
          <button
            type="button"
            className="upload-button"
            onClick={this.clearData}
          >
            Clear
          </button>
        </div>
      </div>
    ) : (
      <p className="home-description">
        No Posts are there Please upload a file to see posts
      </p>
    )
  }

  renderUploadingFileStatus = () => {
    const {postApiStatus, fileName} = this.state
    switch (postApiStatus) {
      case apiStatusConstants.inProgress:
        return (
          <p className="in-progress">
            Your file <span className={{fontWeight: 'bold'}}>{fileName} </span>
            is uploading...
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
    const {getApiStatus} = this.state
    switch (getApiStatus) {
      case apiStatusConstants.inProgress:
        return (
          <div className="react-loader-spinner">
            <Loader height="50" width="50" color="blue" type="ThreeDots" />
          </div>
        )
      case apiStatusConstants.success:
        return this.renderPostsSuccess()
      case apiStatusConstants.failure:
        return (
          <p className="home-description failure">
            Fetching Failed Please Try Again
          </p>
        )
      case apiStatusConstants.cleared:
        return <p className="home-description success">Database cleared...!</p>
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
              src="https://res.cloudinary.com/dpx8zts9r/image/upload/v1641739592/financepeer_file_upload_icon_czdjsp.png"
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
            src="https://res.cloudinary.com/dpx8zts9r/image/upload/v1641739592/financepeer_file_upload_icon_czdjsp.png"
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
