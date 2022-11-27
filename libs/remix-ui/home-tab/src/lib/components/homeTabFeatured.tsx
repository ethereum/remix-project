/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import { FormattedMessage } from 'react-intl'
import { ThemeContext, themes } from '../themeContext'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
const _paq = window._paq = window._paq || [] // eslint-disable-line

function HomeTabFeatured() {
  const themeFilter = useContext(ThemeContext)

  return (
    <div className="pt-3 pl-2" id="hTFeaturedeSection">
      <label style={{ fontSize: "1.2rem" }}><FormattedMessage id='home.featured' defaultMessage='Featured' /></label>
      <div className="mb-2">
        <div className="w-100 d-flex flex-column" style={{ height: "200px" }}>
          <ThemeContext.Provider value={themeFilter}>
            <Carousel
              arrows={false}
              swipeable={false}
              draggable={true}
              showDots={true}
              responsive={{ desktop: { breakpoint: { max: 2000, min: 1024 }, items: 1 } }}
              renderDotsOutside={true}
              ssr={true} // means to render carousel on server-side.
              infinite={true}
              partialVisible={false}
              centerMode={false}
              autoPlay={true}
              keyBoardControl={true}
              containerClass="border w-full carousel-container"
              sliderClass="h-100 justify-content-between"
              deviceType={"desktop"}
              itemClass=""
              autoPlaySpeed={15000}
              dotListClass="position-relative mt-2"
            >
              <div className="mx-1 px-1 d-flex">
                <img src={"assets/img/bgRemi.webp"} style={{ flex: "1", height: "170px", maxWidth: "170px" }} alt="" ></img>
                <div className="h6 w-50 p-4" style={{ flex: "1" }}>
                  <h5><FormattedMessage id='home.jumpIntoWeb3' defaultMessage='JUMP INTO WEB3' /></h5>
                  <p>
                    <FormattedMessage
                      id='home.jumpIntoWeb3Text'
                      defaultMessage='The Remix Project is a rich toolset which can be used for the entire journey of contract development by users of any knowledge level, and as a learning lab for teaching and experimenting with Ethereum.'
                    />
                  </p>
                  <a className="remixui_home_text" onClick={() => _paq.push(['trackEvent', 'hometab', 'featuredSection', 'jumpIntoWeb3'])} target="__blank" href="https://remix-project.org"><FormattedMessage id='home.more' defaultMessage='More' /></a>
                </div>
              </div>
              <div className="mx-1 px-1 d-flex">
                <img src={"/assets/img/remixRewardUser.webp"} style={{ flex: "1", height: "170px", maxWidth: "170px" }} alt="" ></img>
                <div className="h6 p-4" style={{ flex: "1" }}>
                  <h5><FormattedMessage id='home.remixRewards' defaultMessage='REMIX REWARDS' /></h5>
                  <p style={{ fontStyle: 'italic' }}><FormattedMessage id='home.remixRewardsText1' defaultMessage='NFTs for our users!' /></p>
                  <p>
                    <FormattedMessage
                      id='home.remixRewardsText2'
                      defaultMessage='Remix Project rewards contributors, beta testers, and UX research participants with NFTs deployed on Optimism. Remix Reward holders are able to mint a second “Remixer” user NFT badge to give to any other user of their choice.'
                    />
                  </p>
                  <a className="remixui_home_text" target="__blank" onClick={() => _paq.push(['trackEvent', 'hometab', 'featuredSection', 'remixRewards'])} href="https://rewards.remix.ethereum.eth.limo"><FormattedMessage id='home.more' defaultMessage='More' /></a>
                </div>
              </div>
              <div className="mx-1 px-1 d-flex">
                <img src={"/assets/img/remixRewardBetaTester.webp"} style={{ flex: "1", height: "170px", maxWidth: "170px" }} alt="" ></img>
                <div className="h6 p-4" style={{ flex: "1" }}>
                  <h5><FormattedMessage id='home.betaTesting' defaultMessage='BETA TESTING' /></h5>
                  <p style={{ fontStyle: 'italic' }}><FormattedMessage id='home.betaTestingText1' defaultMessage='Our community supports us.' /></p>
                  <p><FormattedMessage id='home.betaTestingText2' defaultMessage='You can join Beta Testing before each release of Remix IDE. Help us test now and get a handle on new features!' /></p>
                  <a className="remixui_home_text" onClick={() => _paq.push(['trackEvent', 'hometab', 'featuredSection', 'betatesting'])} target="__blank" href="https://rewards.remix.ethereum.eth.limo"><FormattedMessage id='home.more' defaultMessage='More' /></a>
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
