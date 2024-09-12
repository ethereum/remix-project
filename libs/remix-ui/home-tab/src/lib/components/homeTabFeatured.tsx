/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import { FormattedMessage } from 'react-intl'
import { ThemeContext, themes } from '../themeContext'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
import * as releaseDetails from './../../../../../../releaseDetails.json'

const _paq = (window._paq = window._paq || []) // eslint-disable-line
export type HomeTabFeaturedProps = {
  plugin: any
  }

function HomeTabFeatured(props:HomeTabFeaturedProps) {
  const themeFilter = useContext(ThemeContext)

  return (
    <div className="pt-1 pl-2" id="hTFeaturedeSection">
      <div className="mb-2 remix_ui-carousel-container">
        <div className="w-100 d-flex flex-column rounded-3 remix_ui-carouselbox">
          <ThemeContext.Provider value={themeFilter}>
            <Carousel
              arrows={false}
              swipeable={false}
              draggable={true}
              showDots={true}
              responsive={{
                desktop: { breakpoint: { max: 2000, min: 1024 }, items: 1 }
              }}
              renderDotsOutside={true}
              ssr={true} // means to render carousel on server-side.
              infinite={true}
              partialVisible={false}
              centerMode={false}
              autoPlay={true}
              keyBoardControl={true}
              containerClass="border w-full carousel-container d-flex align-items-center"
              sliderClass="h-100 justify-content-between"
              deviceType={'desktop'}
              itemClass=""
              autoPlaySpeed={10000}
              dotListClass="position-relative mt-2"
            >
              <div className="mr-1 pr-1 d-flex align-items-center justify-content-center h-100">
                <a href={releaseDetails.moreLink} target="__blank">
                  <img src={'assets/img/remi_drums_whatsnew.webp'} className="remixui_carouselImage" alt=""></img>
                </a>
                <div className="h6 w-50 p-2 pl-4 align-self-center" style={{ flex: '1' }}>
                  <h5>{releaseDetails.version} {releaseDetails.title}</h5>
                  <div style={{ fontSize: '0.8rem' }} className="mb-3">
                    <ul>
                      { releaseDetails.highlight1 ? <li style={{ padding: '0.15rem' }}>{releaseDetails.highlight1}</li> : '' }
                      { releaseDetails.highlight2 ? <li style={{ padding: '0.15rem' }}>{releaseDetails.highlight2}</li> : '' }
                      { releaseDetails.highlight3 ? <li style={{ padding: '0.15rem' }}>{releaseDetails.highlight3}</li> : '' }
                      { releaseDetails.highlight4 ? <li style={{ padding: '0.15rem' }}>{releaseDetails.highlight4}</li> : '' }
                    </ul>
                  </div>
                  <a
                    className="remixui_home_text btn-sm btn-secondary mt-2 text-decoration-none mb-3"
                    onClick={() => _paq.push(['trackEvent', 'hometab', 'featuredSection', 'seeFullChangelog'])}
                    target="__blank"
                    href={releaseDetails.moreLink}
                  >
                    {releaseDetails.more}
                  </a>
                </div>
              </div>
              <div className="mr-1 pr-1 d-flex align-items-center justify-content-center h-100">
                <a href="https://remix-project.org" target="__blank">
                  <img src={'assets/img/remi-prof.webp'} className="remixui_carouselImage" alt=""></img>
                </a>
                <div className="h6 w-50 p-2 pl-4  align-self-center" style={{ flex: '1' }}>
                  <h5>
                    <FormattedMessage id="home.learnEthPromoTitle" />
                  </h5>
                  <div style={{ fontSize: '0.8rem', lineHeight: '1.25rem' }} className="mb-3">
                    <FormattedMessage id="home.learnEthPromoText" />
                  </div>
                  <span
                    className="remixui_home_text btn-sm btn-secondary mt-2 text-decoration-none mb-3"
                    style={{ cursor: 'pointer' }}
                    onClick={async () => {
                      await props.plugin.appManager.activatePlugin(['LearnEth', 'solidityUnitTesting'])
                      props.plugin.verticalIcons.select('LearnEth')
                      await props.plugin.call('LearnEth', 'home')
                    	}
                    }
                  >
                    <FormattedMessage id="home.learnEthPromoButton" />
                  </span>
                </div>
              </div>
              <div className="mr-1 pr-1 d-flex align-items-center justify-content-center h-100">
                <a href="https://www.youtube.com/@EthereumRemix/videos" target="__blank">
                  <img src={'/assets/img/YouTubeLogo.webp'} className="remixui_carouselImage" alt=""></img>
                </a>
                <div className="h6 w-50 p-2 pl-4  align-self-center" style={{ flex: '1' }}>
                  <h5>
                    <FormattedMessage id="home.remixYouTube" />
                  </h5>
                  <p style={{ fontStyle: 'italic', fontSize: '1rem' }}>
                    <FormattedMessage id="home.remixYouTubeText1" />
                  </p>
                  <div style={{ fontSize: '0.8rem' }} className="mb-3">
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
              <div className="mr-1 pr-1 d-flex align-items-center justify-content-center h-100">
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSd0WsJnKbeJo-BGrnf7WijxAdmE4PnC_Z4M0IApbBfHLHZdsQ/viewform" target="__blank">
                  <img src={'/assets/img/remixRewardBetaTester_small.webp'} className="remixui_carouselImage_remixbeta" alt=""></img>
                </a>
                <div className="h6 w-50 p-2 pl-4  align-self-center" style={{ flex: '1' }}>
                  <h5>
                    <FormattedMessage id="home.betaTesting" />
                  </h5>
                  <p style={{ fontStyle: 'italic', fontSize: '1rem' }}>
                    <FormattedMessage id="home.betaTestingText1" />
                  </p>
                  <div style={{ fontSize: '0.8rem' }} className="mb-3">
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
