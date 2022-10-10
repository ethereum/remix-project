/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from 'react'
import { ThemeContext, themes } from '../themeContext'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
import CustomNavButtons from './customNavButtons'

function HomeTabFeatured() {
  const themeFilter = useContext(ThemeContext)

  useEffect(() => {
    return () => {
    }
  }, [])

  const openLink = (url = "") => {
    if (url === "") {
      window.open("https://remix-ide.readthedocs.io/en/latest/search.html?q=" + state.searchInput + "&check_keywords=yes&area=default", '_blank')
    } else {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="pt-3 pl-2" id="hTFeaturedeSection">
      <label style={{ fontSize: "1.2rem" }}>Featured</label>
      <div className="mb-2">
        <div className="w-100 d-flex flex-column" style={{ height: "200px" }}>
          <ThemeContext.Provider value={ themeFilter }>
            <Carousel
              customButtonGroup={<CustomNavButtons next={undefined} previous={undefined} goToSlide={undefined} />}
              arrows={false}
              swipeable={false}
              draggable={true}
              showDots={true}
              responsive={{ desktop: { breakpoint: { max: 2000, min: 1024 }, items: 1 } }}
              renderDotsOutside={true}
              ssr={true} // means to render carousel on server-side.
              infinite={true}
              centerMode={false}
              autoPlay={true}
              keyBoardControl={true}
              containerClass="border carousel-container"
              sliderClass="px-2 h-100 justify-content-between"
              deviceType={"desktop"}
              itemClass="px-2 carousel-item-padding-10-px"
              autoPlaySpeed={15000}
              dotListClass="position-relative mt-2"
            >
              <div className="d-flex">
                <img src={"assets/img/bgRemi.webp"} style={{ flex: "1", height: "170px", maxWidth: "max-content"}} alt="" ></img>
                <div className="h6 w-50 p-4" style={{ flex: "1"}}>
                  <h5>JUMP INTO WEB3</h5>
                  <span>The Remix Project is a rich toolset which can be used for the entire journey of contract development by users of any knowledge level, and as a learning lab for teaching and experimenting with Ethereum.</span>
                </div>
              </div>
              <div className="d-flex">
                <img src={"/assets/img/remixRewardUser.webp"} style={{ flex: "1", height: "170px", maxWidth: "max-content" }} alt="" ></img>
                <div className="h6 p-4" style={{ flex: "1"}}>
                  <h5>REMIX REWARDS</h5>
                  <p style={{fontStyle: 'italic'}}>NFTs for our users!</p>
                  <span>Remix Project rewards contributors, beta testers, and UX research participants with NFTs deployed on Optimism. Remix Reward holders are able to mint a second “Remixer” user NFT badge to give to any other user of their choice</span>
                </div>
              </div>
              <div className="d-flex">
                <img src={"/assets/img/remixRewardBetaTester.webp"} style={{ flex: "1", height: "170px", maxWidth: "max-content" }} alt="" ></img>
                <div className="h6 p-4" style={{ flex: "1"}}>
                  <h5>BETA TESTING</h5>
                  <p style={{fontStyle: 'italic'}}>Our community supports us.</p>
                  <span>You can join Beta Testing before each release of Remix IDE. Help us test now and get a handle on new features!</span>
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
