/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../themeContext'
import axios from 'axios'
import { HOME_TAB_BASE_URL, HOME_TAB_NEW_UPDATES } from './constant'
import { LoadingCard } from './LoaderPlaceholder'
declare global {
  interface Window {
    _paq: any
  }
}
const _paq = (window._paq = window._paq || []) //eslint-disable-line
interface HomeTabUpdatesProps {
  plugin: any
}

interface UpdateInfo {
  badge: string
  title: string
  description: string
  descriptionList?: string[]
  icon: string
  action: {
    type: 'link' | 'methodCall'
    label: string
    url?: string
    pluginName?: string
    pluginMethod?: string,
    pluginArgs?: (string | number | boolean | object | null)[]
  },
  theme: string
}

function HomeTabUpdates({ plugin }: HomeTabUpdatesProps) {
  const [pluginList, setPluginList] = useState<UpdateInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const theme = useContext(ThemeContext)
  const isDark = theme.name === 'dark'

  useEffect(() => {
    async function getLatestUpdates() {
      try {
        setIsLoading(true)
        const response = await axios.get(HOME_TAB_NEW_UPDATES)
        setPluginList(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching plugin list:', error)
      }
    }
    getLatestUpdates()
  }, [])

  const handleUpdatesActionClick = (updateInfo: UpdateInfo) => {
    _paq.push(['trackEvent', 'hometab', 'updatesActionClick', updateInfo.title])
    if (updateInfo.action.type === 'link') {
      window.open(updateInfo.action.url, '_blank')
    } else if (updateInfo.action.type === 'methodCall') {
      plugin.call(updateInfo.action.pluginName, updateInfo.action.pluginMethod, updateInfo.action.pluginArgs)
    }
  }

  function UpdateCard(updateInfo: UpdateInfo) {
    return (
      <div className="card border h-100 d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex align-items-center p-3 overflow-hidden justify-content-between" style={{ height: '80px', backgroundColor: 'var(--body-bg)' }}>
            <span className={`badge bg-info bg-transparent border p-2 rounded-pill text-${updateInfo.theme}`} style={{ fontWeight: 'light', border: `1px solid var(--${updateInfo.theme})` }}>{updateInfo.badge}</span>
            { updateInfo.icon ? <img src={`${HOME_TAB_BASE_URL + updateInfo.icon}`} alt="RemixAI Assistant" style={{ height: '150px', width: '150px' }} />
              :
              <svg width="160" height="161" viewBox="0 0 160 161" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M145.411 39.5641C147.355 39.8987 148.46 41.8095 147.78 43.6627C144.363 52.9812 134.035 76.4055 113.144 88.5742L112.711 88.827L112.96 89.2628C124.967 110.247 122.199 135.698 120.5 145.476C120.161 147.421 118.249 148.523 116.398 147.841C107.13 144.424 83.11 133.892 71.118 112.935L70.8644 112.493L70.4238 112.749C49.5574 124.904 24.3214 122.236 14.592 120.562C12.6474 120.228 11.5422 118.317 12.2215 116.463C15.6389 107.145 25.9674 83.7197 46.8579 71.5509L47.2917 71.2981L47.0425 70.8623C35.0353 49.8787 37.8028 24.4284 39.5024 14.6497C39.8404 12.7049 41.7533 11.6025 43.6047 12.2852C52.8734 15.7028 76.8932 26.2334 88.8851 47.1901L89.1387 47.6321L89.5784 47.3758C110.445 35.221 135.682 37.8906 145.411 39.5641ZM85.8533 59.4935C84.6546 59.1724 83.3831 59.6349 82.6604 60.6408L82.6602 60.6418L75.2745 70.9698L62.6382 72.2023L62.6361 72.2027C61.4038 72.3258 60.3681 73.1958 60.047 74.3944C59.7261 75.5928 60.1881 76.8634 61.1936 77.586L61.1952 77.5875L71.5226 84.972L72.7545 97.6101L72.754 97.612C72.877 98.8444 73.7471 99.8799 74.9457 100.201C76.1443 100.522 77.4156 100.06 78.1383 99.0547L78.1388 99.0528L85.5238 88.7236L98.1608 87.4924L98.1629 87.4919C99.395 87.3688 100.43 86.4995 100.752 85.3012C101.073 84.1026 100.611 82.8314 99.6054 82.1086L99.6037 82.1071L89.2757 74.7214L88.0444 62.0845L88.0447 62.0835L88.013 61.8547C87.8119 60.724 86.9771 59.7947 85.8533 59.4935Z" stroke="url(#paint0_linear_216_16645)" stroke-opacity="0.32" stroke-width="1.01184"/>
                <path d="M153.663 57.8723C155.455 58.6988 156.028 60.8304 154.891 62.4446C149.179 70.561 133.14 90.514 109.811 96.8612L109.327 96.9932L109.455 97.4786C115.622 120.855 106.361 144.723 102.189 153.728C101.359 155.519 99.2266 156.089 97.6151 154.951C89.547 149.251 69.0715 132.862 62.9122 109.515L62.7816 109.022L62.2897 109.156C38.9885 115.496 15.303 106.387 6.33819 102.252C4.54643 101.426 3.97352 99.2936 5.10935 97.6794C10.8221 89.563 26.8616 69.6091 50.1898 63.2618L50.6742 63.1299L50.5462 62.6444C44.3791 39.2682 53.6394 15.4014 57.812 6.39572C58.6419 4.60464 60.7749 4.03494 62.3865 5.17355C70.4548 10.8736 90.9307 27.2621 97.0899 50.6085L97.2205 51.1011L97.7115 50.9674C121.013 44.6274 144.699 53.7377 153.663 57.8723ZM90.977 61.708C89.9023 61.0875 88.5545 61.2052 87.596 61.9899L87.5956 61.9907L77.7884 70.0553L65.2638 67.9752L65.2616 67.9751C64.0394 67.7751 62.8139 68.3474 62.1935 69.422C61.5733 70.4965 61.6908 71.8434 62.475 72.8016L62.4762 72.8035L70.5404 82.6093L68.4593 95.1356L68.4584 95.1373C68.2582 96.3595 68.8306 97.585 69.9053 98.2054C70.9799 98.8258 72.3274 98.7089 73.2858 97.9244L73.2867 97.9227L83.0935 89.8568L95.6185 91.9382L95.6207 91.9384C96.8427 92.1383 98.0679 91.5666 98.6883 90.4923C99.3087 89.4177 99.1916 88.0702 98.4073 87.1118L98.4061 87.11L90.3416 77.3028L92.423 64.7778L92.4235 64.777L92.4521 64.5477C92.5505 63.4035 91.9847 62.2898 90.977 61.708Z" stroke="url(#paint1_linear_216_16645)" stroke-opacity="0.32" stroke-width="1.01184"/>
                <path d="M156.896 77.6955C158.413 78.9576 158.414 81.1647 156.899 82.4298C149.28 88.7911 128.623 103.913 104.447 104.006L103.945 104.008L103.943 104.51C103.85 128.686 88.7273 149.344 82.366 156.963C81.1009 158.477 78.8937 158.476 77.6317 156.96C71.3138 149.366 55.7778 128.236 55.8709 104.09L55.8723 103.581L55.3627 103.582C31.2145 103.675 10.6936 88.7466 3.10445 82.4326C1.58763 81.1706 1.58609 78.9628 3.101 77.6976C10.7197 71.3363 31.3772 56.2136 55.5533 56.1205L56.0553 56.1184L56.0574 55.6164C56.1506 31.4405 71.2725 10.7836 77.6338 3.16479C78.8989 1.64952 81.1067 1.6513 82.3688 3.16824C88.6868 10.7623 104.223 31.8919 104.13 56.0369L104.129 56.5465L104.638 56.5444C128.786 56.4514 149.307 71.3816 156.896 77.6955ZM95.3529 65.1761C94.4754 64.2986 93.143 64.0635 92.0142 64.5733L92.0135 64.574L80.4532 69.8255L68.8937 64.5747L68.8916 64.574C67.7629 64.0645 66.431 64.3001 65.5536 65.1775C64.6765 66.0549 64.4413 67.3863 64.9507 68.5148L64.9514 68.5169L70.2029 80.0758L64.9507 91.6367L64.9494 91.6381C64.4397 92.7668 64.6755 94.0987 65.5529 94.9761C66.4303 95.8535 67.7622 96.0893 68.8909 95.5796L68.8923 95.5783L80.4525 90.3254L92.0121 95.5776L92.0142 95.5783C93.1427 96.0876 94.4741 95.8525 95.3515 94.9754C96.2289 94.098 96.4645 92.7661 95.955 91.6374L95.9543 91.6353L90.7028 80.0751L95.955 68.5155L95.9557 68.5148L96.0427 68.3008C96.4339 67.2211 96.1756 65.9989 95.3529 65.1761Z" stroke="url(#paint2_linear_216_16645)" stroke-opacity="0.32" stroke-width="1.01184"/>
                <path d="M154.889 97.6765C156.027 99.2881 155.457 101.42 153.666 102.25C144.66 106.423 120.794 115.683 97.4174 109.516L96.932 109.388L96.8001 109.872C90.4528 133.201 70.4989 149.24 62.3825 154.953C60.7684 156.089 58.6368 155.516 57.8103 153.725C53.673 144.755 44.1354 120.323 50.4745 97.0248L50.6078 96.5329L50.1152 96.4024C26.7657 90.2423 10.8079 70.511 5.11153 62.4479C3.97301 60.8364 4.54294 58.7034 6.3337 57.8734C15.3392 53.7008 39.2068 44.4399 62.5833 50.6071L63.0687 50.7351L63.2006 50.2507C69.5479 26.9227 89.5009 10.8835 97.6173 5.17075C99.2316 4.03457 101.364 4.60769 102.19 6.39959C106.327 15.3701 115.866 39.8009 109.527 63.0991L109.393 63.591L109.886 63.7207C133.235 69.8808 149.193 89.6135 154.889 97.6765ZM98.683 69.6551C98.0625 68.5804 96.8363 68.0084 95.614 68.2087L95.6132 68.2092L83.0877 70.2898L73.281 62.226L73.2792 62.2248C72.3208 61.4406 70.9733 61.3234 69.8987 61.9438C68.8244 62.5643 68.2527 63.7895 68.4526 65.0115L68.4528 65.0136L70.5337 77.5378L62.4683 87.3454L62.4666 87.3464C61.6821 88.3048 61.5651 89.6523 62.1856 90.7269C62.806 91.8015 64.0315 92.374 65.2537 92.1738L65.2554 92.1728L77.7812 90.091L87.5875 98.156L87.5893 98.1572C88.5476 98.9413 89.8945 99.0588 90.969 98.4387C92.0436 97.8183 92.6159 96.5927 92.4159 95.3706L92.4158 95.3684L90.3352 82.8429L98.4003 73.0366L98.4011 73.0361L98.5406 72.8519C99.1979 71.9102 99.2647 70.6628 98.683 69.6551Z" stroke="url(#paint3_linear_216_16645)" stroke-opacity="0.32" stroke-width="1.01184"/>
                <path d="M147.778 116.46C148.46 118.311 147.358 120.223 145.413 120.561C135.634 122.261 110.184 125.028 89.2006 113.021L88.7648 112.772L88.512 113.206C76.3433 134.096 52.9179 144.425 43.5996 147.842C41.7465 148.521 39.8356 147.417 39.5009 145.473C37.8263 135.737 34.937 109.67 47.0902 88.806L47.3462 88.3654L46.9042 88.1117C25.9447 76.1183 15.6375 52.9292 12.2221 43.6665C11.5394 41.8152 12.642 39.9024 14.5866 39.5641C24.3652 37.8645 49.8164 35.0966 70.8001 47.1039L71.2359 47.3531L71.4887 46.9194C83.6574 26.0291 107.082 15.7007 116.4 12.2832C118.254 11.6036 120.165 12.709 120.499 14.6537C122.174 24.3894 125.064 50.4565 112.911 71.3201L112.655 71.7607L113.097 72.0134C134.056 84.0069 144.363 107.197 147.778 116.46ZM100.74 74.8462C100.419 73.6475 99.3823 72.7776 98.1498 72.6547L98.1488 72.655L85.5116 71.4228L78.1262 61.0957L78.1247 61.0941C77.4019 60.0885 76.1307 59.6266 74.9321 59.9477C73.7338 60.269 72.8645 61.3045 72.7414 62.5365L72.7409 62.5387L71.5095 75.1747L61.1805 82.5606L61.1786 82.5611C60.1728 83.2838 59.7111 84.5552 60.0322 85.7537C60.3534 86.9523 61.3889 87.8224 62.6213 87.9454L62.6232 87.9449L75.2611 89.1759L82.6458 99.5042L82.6473 99.5058C83.3699 100.511 84.6405 100.973 85.8389 100.652C87.0374 100.331 87.9075 99.2956 88.0306 98.0634L88.031 98.0612L89.2632 85.424L99.5915 78.0393L99.5925 78.039L99.7748 77.8971C100.653 77.1577 101.041 75.97 100.74 74.8462Z" stroke="url(#paint4_linear_216_16645)" stroke-opacity="0.32" stroke-width="1.01184"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M54.297 107.311C59.0561 106.875 71.2381 104.96 79.5169 96.6168C87.7958 104.96 100.395 106.875 105.154 107.311C106.255 107.412 107.137 106.531 107.038 105.43C106.607 100.645 104.712 88.3513 96.4241 79.9992C104.712 71.6472 106.607 59.3532 107.038 54.5684C107.137 53.4671 106.255 52.5864 105.154 52.6873C100.395 53.1238 88.213 55.0388 79.9342 63.3817C71.6553 55.0388 59.0561 53.1238 54.297 52.6873C53.196 52.5864 52.3143 53.4671 52.4134 54.5684C52.8438 59.3532 54.7391 71.6472 63.027 79.9992C54.7391 88.3513 52.8438 100.645 52.4134 105.43C52.3143 106.531 53.196 107.412 54.297 107.311ZM69.953 79.8489C69.953 79.3523 70.2634 78.9075 70.7289 78.7316L76.5739 76.5382L78.7671 70.6927C78.943 70.2272 79.3878 69.9168 79.8844 69.9168C80.381 69.9168 80.8258 70.2272 81.0017 70.6927L83.1949 76.5382L89.0399 78.7316C89.5054 78.9075 89.8158 79.3523 89.8158 79.8489C89.8158 80.3456 89.5054 80.7904 89.0399 80.9663L83.1949 83.1597L81.0017 89.0051C80.8258 89.4707 80.381 89.7811 79.8844 89.7811C79.3878 89.7811 78.943 89.4707 78.7671 89.0051L76.5739 83.1597L70.7289 80.9663C70.2634 80.7904 69.953 80.3456 69.953 79.8489Z" fill={`var(--ai)`}/>
                <defs>
                  <linearGradient id="paint0_linear_216_16645" x1="94.6422" y1="25.4218" x2="65.3602" y2="134.704" gradientUnits="userSpaceOnUse">
                    <stop stop-color={`var(--ai)`}/>
                    <stop offset="1" stop-color="#8D1D93" stop-opacity="0"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_216_16645" x1="108.285" y1="31.072" x2="51.7164" y2="129.052" gradientUnits="userSpaceOnUse">
                    <stop stop-color={`var(--ai)`}/>
                    <stop offset="1" stop-color="#8D1D93" stop-opacity="0"/>
                  </linearGradient>
                  <linearGradient id="paint2_linear_216_16645" x1="120" y1="40.0636" x2="40.0002" y2="120.064" gradientUnits="userSpaceOnUse">
                    <stop stop-color={`var(--ai)`}/>
                    <stop offset="1" stop-color="#8D1D93" stop-opacity="0"/>
                  </linearGradient>
                  <linearGradient id="paint3_linear_216_16645" x1="128.99" y1="51.7775" x2="31.0105" y2="108.346" gradientUnits="userSpaceOnUse">
                    <stop stop-color={`var(--ai)`}/>
                    <stop offset="1" stop-color="#8D1D93" stop-opacity="0"/>
                  </linearGradient>
                  <linearGradient id="paint4_linear_216_16645" x1="134.641" y1="65.4218" x2="25.3592" y2="94.7038" gradientUnits="userSpaceOnUse">
                    <stop stop-color={`var(--ai)`}/>
                    <stop offset="1" stop-color="#8D1D93" stop-opacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            }
          </div>
          <div className="px-3" style={{ fontSize: '1rem', zIndex: 1 }}>
            <span className="d-block my-2" style={{ color: isDark ? 'white' : 'black' }}>
              {updateInfo.title}
            </span>
            {Array.isArray(updateInfo.descriptionList) && updateInfo.descriptionList.length > 0 ? (
              <div className="mb-3 small">
                <ul className="list-unstyled">
                  {updateInfo.descriptionList.map((description: string, index: number) => (
                    <li key={`description-${index}`} className='mb-1'><i className="far fa-check-circle mr-2"></i>{description}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mb-3 small">{updateInfo.description}</div>
            )}
          </div>
        </div>
        <div className="px-3 pb-3">
          <button className={`btn btn-light btn-sm w-100 border ${updateInfo.theme !== 'primary' && `text-${updateInfo.theme}`}`} onClick={() => handleUpdatesActionClick(updateInfo)}>
            {updateInfo.action.label}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-100 align-items-end">
      <div className="row">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`loading-${index}`} className="col-lg-12 col-xl-6 col-md-6 col-sm-12 mb-4">
              <LoadingCard />
            </div>
          ))
        ) : (
          pluginList.map((updateInfo: UpdateInfo, index: number) => (
            <div key={`update-${index}`} className="col-lg-12 col-xl-6 col-md-6 col-sm-12 mb-4">
              {UpdateCard(updateInfo)}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default HomeTabUpdates
