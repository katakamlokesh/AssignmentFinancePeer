import './index.css'

const PostCard = props => {
  const {postDetails} = props
  const {id, userId, title, body} = postDetails
  return (
    <li key={id} className="post-container">
      <div className="image-user-container">
        <img
          className="card-image"
          src="https://res.cloudinary.com/dpx8zts9r/image/upload/v1641742440/financepeer_user_icon_eo2435.jpg"
          alt={`user ${userId}`}
        />
        <h1 className="username">user {userId}</h1>
      </div>

      <div className="card-data-container">
        <h1 className="card-title">{title}</h1>
        <p className="card-body">{body}</p>
      </div>
    </li>
  )
}

export default PostCard
