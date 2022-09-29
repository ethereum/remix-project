/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from 'react'
import { ThemeContext, themes } from '../themeContext'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
import CustomNavButtons from './customNavButtons'

function HomeTabFeatured () {
  const [state, setState] = useState<{
    themeQuality: { filter: string, name: string },
  }>({
    themeQuality: themes.light,
  })

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
    <div className="pt-4 pl-2" id="hTFeaturedeSection">
      <label style={{fontSize: "1.2rem"}}>Featured</label>
      <div className=" mb-4">
        <div className="w-100 d-flex flex-column" style={{height: "230px"}}>
          <ThemeContext.Provider value={ state.themeQuality }>
            <Carousel 
              customButtonGroup={<CustomNavButtons next={undefined} previous={undefined} goToSlide={undefined} />}
              arrows={false}
              swipeable={false}
              draggable={true}
              showDots={true}
              responsive={{ desktop: { breakpoint: { max: 3000, min: 1024 }, items: 1} }}
              renderDotsOutside={true}
              ssr={true} // means to render carousel on server-side.
              infinite={true}
              autoPlay={true}
              keyBoardControl={true}
              containerClass="border carousel-container"
              deviceType={"desktop"}
              itemClass="p-2 carousel-item-padding-10-px"
              autoPlaySpeed={10000}
              dotListClass="position-relative mt-2"
            >
              <div>
                <img src={"assets/img/solidityLogo.webp"} style={{width: "300px", height:"200px"}} alt="" ></img>
              </div><div>
                <img src={"assets/img/bgRemi.webp"} alt="" ></img>
              </div><div>
                <img src={"assets/img/homeStickers.png"} alt="" ></img>blablabla
              </div><div>
                <img src={"assets/img/solidityLogo.webp"} alt="" ></img>blablabla
              </div>
            </Carousel>
          </ThemeContext.Provider>
        </div>
      </div>
    </div>
  )
}

export default HomeTabFeatured
