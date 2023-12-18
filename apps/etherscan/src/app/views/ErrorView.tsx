import React from 'react'

export const ErrorView: React.FC<React.PropsWithChildren> = () => {
  return (
    <div className="d-flex w-100 flex-column align-items-center">
      <img className="pb-4" width="250" src="https://res.cloudinary.com/key-solutions/image/upload/v1580400635/solid/error-png.png" alt="Error page" />
      <h5>Sorry, something unexpected happened.</h5>
      <h5>
        Please raise an issue:{' '}
        <a className="text-danger" href="https://github.com/ethereum/remix-project/issues">
          Here
        </a>
      </h5>
    </div>
  )
}
