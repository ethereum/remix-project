/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useEffect, useState, useRef, useContext} from 'react'
import {FormattedMessage} from 'react-intl'
import {ThemeContext, themes} from '../themeContext'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'

const _paq = (window._paq = window._paq || []) // eslint-disable-line

function HomeTabFeatured() {
  const themeFilter = useContext(ThemeContext)

  return (
    <div className="pt-3 pl-2" id="hTFeaturedeSection">
      <label style={{fontSize: '1.2rem'}}>
        <FormattedMessage id="home.featured" />
      </label>
      <div className="mb-2">
        <div className="w-100 d-flex flex-column" style={{height: '200px'}}>
          <ThemeContext.Provider value={themeFilter}>
            <Carousel
              arrows={false}
              swipeable={false}
              draggable={true}
              showDots={true}
              responsive={{
                desktop: {breakpoint: {max: 2000, min: 1024}, items: 1}
              }}
              renderDotsOutside={true}
              ssr={true} // means to render carousel on server-side.
              infinite={true}
              partialVisible={false}
              centerMode={false}
              autoPlay={true}
              keyBoardControl={true}
              containerClass="border w-full carousel-container"
              sliderClass="h-100 justify-content-between"
              deviceType={'desktop'}
              itemClass=""
              autoPlaySpeed={15000}
              dotListClass="position-relative mt-2"
            >
              <div className="mr-1 pr-1 d-flex">
                <a href="https://cryptpad.fr/form/#/2/form/view/pV-DdryeJoYUWvW+gXsFaMNynEY7t5mUsgeD1urgwSE/" target="__blank">
                  <img src={'/assets/img/soliditySurvey2023.webp'} style={{flex: '1', height: '170px', maxWidth: '170px'}} alt=""></img>
                </a>
                <div className="h6 w-50 p-2 pl-4  align-self-center" style={{flex: '1'}}>
                  <h5>
                  SOLIDITY DEVELOPER SURVEY 2023
                  </h5>
                  <p className='pt-2 mb-1'>
                    Please take a few minutes of your time to complete the survey.
                  </p>
                  <p className="mb-3">
                    Thank you for your support! Read the full announcement
                    <a
                      className="mx-1"
                      onClick={() => _paq.push(['trackEvent', 'hometab', 'featuredSection', 'soliditySurvey23'])}
                      target="__blank"
                      href="https://soliditylang.org/blog/2023/12/08/solidity-developer-survey-2023-announcement/"
                    >
                      here.
                    </a>
                  </p>
                  <a
                    href="https://cryptpad.fr/form/#/2/form/view/pV-DdryeJoYUWvW+gXsFaMNynEY7t5mUsgeD1urgwSE/"
                    target="__blank"
                    className='remixui_home_text btn-sm btn btn-secondary text-decoration-none'
                    style={{cursor: 'pointer'}}
                  >
                    Start Survey
                  </a>
                </div>
              </div>
              <div className="mr-1 pr-1 d-flex">
                <a href="https://medium.com/remix-ide/remix-release-v0-38-0-dccd551b6f1e" target="__blank">
                  <img src={'assets/img/remi_drums_whatsnew.webp'} style={{flex: '1', height: '170px', maxWidth: '170px'}} alt=""></img>
                </a>
                <div className="h6 w-50 p-2 pl-4 align-self-center" style={{flex: '1'}}>
                  <h5>
                    <FormattedMessage id="homeReleaseDetails.title" />
                  </h5>
                  <div style={{fontSize: '0.8rem'}} className="mb-3">
                    <ul>
                      <li style={{padding: '0.15rem'}}><FormattedMessage id="homeReleaseDetails.highlight1" /></li>
                      <li style={{padding: '0.15rem'}}><FormattedMessage id="homeReleaseDetails.highlight2" /></li>
                      <li style={{padding: '0.15rem'}}><FormattedMessage id="homeReleaseDetails.highlight3" /></li>
                      <li style={{padding: '0.15rem'}}><FormattedMessage id="homeReleaseDetails.highlight4" /></li>
                    </ul>
                  </div>
                  <a
                    className="remixui_home_text btn-sm btn-secondary mt-2 text-decoration-none mb-3"
                    onClick={() => _paq.push(['trackEvent', 'hometab', 'featuredSection', 'seeFullChangelog'])}
                    target="__blank"
                    href="https://medium.com/remix-ide/remix-release-v0-38-0-dccd551b6f1e"
                  >
                    <FormattedMessage id="homeReleaseDetails.more" />
                  </a>
                </div>
              </div>
              <div className="mr-1 pr-1 d-flex">
                <a href="https://remix-project.org" target="__blank">
                  <img src={'assets/img/bgRemi_small.webp'} style={{flex: '1', height: '170px', maxWidth: '170px'}} alt=""></img>
                </a>
                <div className="h6 w-50 p-2 pl-4  align-self-center" style={{flex: '1'}}>
                  <h5>
                    <FormattedMessage id="home.jumpIntoWeb3" />
                  </h5>
                  <div style={{fontSize: '0.8rem', lineHeight: '1.25rem'}} className="mb-3">
                    <FormattedMessage id="home.jumpIntoWeb3Text" />
                  </div>
                  <a
                    className="remixui_home_text btn-sm btn-secondary mt-2 text-decoration-none mb-3"
                    onClick={() => _paq.push(['trackEvent', 'hometab', 'featuredSection', 'jumpIntoWeb3'])}
                    target="__blank"
                    href="https://remix-project.org/"
                  >
                    <FormattedMessage id="home.jumpIntoWeb3More" />
                  </a>
                </div>
              </div>
              <div className="mr-1 pr-1 d-flex">
                <a href="https://www.youtube.com/@EthereumRemix/videos" target="__blank">
                  <img src={'/assets/img/YouTubeLogo.webp'} style={{flex: '1', height: '170px', maxWidth: '170px'}} alt=""></img>
                </a>
                <div className="h6 w-50 p-2 pl-4  align-self-center" style={{flex: '1'}}>
                  <h5>
                    <FormattedMessage id="home.remixYouTube" />
                  </h5>
                  <p style={{fontStyle: 'italic', fontSize: '1rem'}}>
                    <FormattedMessage id="home.remixYouTubeText1" />
                  </p>
                  <div style={{fontSize: '0.8rem'}} className="mb-3">
                    <FormattedMessage id="home.remixYouTubeText2" />
                  </div>
                  <a
                    className="remixui_home_text btn-sm btn-secondary mt-2 text-decoration-none mb-3"
                    onClick={() => _paq.push(['trackEvent', 'hometab', 'featuredSection', 'youTubeMore'])}
                    target="__blank"
                    href="https://www.youtube.com/@EthereumRemix/videos"
                  >
                    <FormattedMessage id="home.remixYouTubeMore" />
                  </a>
                </div>
              </div>
              <div className="mr-1 pr-1 d-flex">
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSd0WsJnKbeJo-BGrnf7WijxAdmE4PnC_Z4M0IApbBfHLHZdsQ/viewform" target="__blank">
                  <img src={'/assets/img/remixRewardBetaTester_small.webp'} style={{flex: '1', height: '170px', maxWidth: '170px'}} alt=""></img>
                </a>
                <div className="h6 w-50 p-2 pl-4  align-self-center" style={{flex: '1'}}>
                  <h5>
                    <FormattedMessage id="home.betaTesting" />
                  </h5>
                  <p style={{fontStyle: 'italic', fontSize: '1rem'}}>
                    <FormattedMessage id="home.betaTestingText1" />
                  </p>
                  <div style={{fontSize: '0.8rem'}} className="mb-3">
                    <FormattedMessage id="home.betaTestingText2" />
                  </div>
                  <a
                    className="remixui_home_text btn-sm btn-secondary mt-2 text-decoration-none mb-3"
                    onClick={() => _paq.push(['trackEvent', 'hometab', 'featuredSection', 'betatesting'])}
                    target="__blank"
                    href="https://docs.google.com/forms/d/e/1FAIpQLSd0WsJnKbeJo-BGrnf7WijxAdmE4PnC_Z4M0IApbBfHLHZdsQ/viewform"
                  >
                    <FormattedMessage id="home.betaTestingMore" />
                  </a>
                </div>
              </div>
            </Carousel>
          </ThemeContext.Provider>
        </div>
      </div>
    </div>
  )
}

export default HomeTabFeatured
