import React from 'react'
import { FormattedMessage } from 'react-intl'
import { CustomTooltip } from '@remix-ui/helper'

// profile 타입은 기존과 동일하게 사용합니다.
interface PluginCardProps {
  profile: any;
  isActive: boolean;
  togglePlugin: (pluginName: string) => void;
  // activate/deactivate 대신 하나의 토글 함수를 받습니다.
}

function PluginCard({ profile, isActive, togglePlugin }: PluginCardProps) {
  return (
    <article className="px-3 pt-1 pb-3 mb-2 border rounded bg-light" data-id={`plugin-manager-plugin-card-${profile.name}`}>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          {profile.icon ? <img src={profile.icon} className="mr-2 remixui_pluginIcon text-dark" alt={`${profile.name} icon`} /> : <i className="fas fa-puzzle-piece mr-2 text-dark"></i>}
          {/* 5. 제목 텍스트 크기 조절 (small 클래스 추가) */}
          <div className="font-weight-bold m-0 text-dark">{profile.displayName || profile.name}</div>
        </div>

        {/* ======================= 이 부분을 교체합니다 ======================= */}
        <label className="plugin-manager-switch">
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => togglePlugin(profile.name)}
          />
          <span className="plugin-manager-slider"></span>
        </label>
        {/* ================================================================= */}

      </div>

      {/* 카드 본문: Maintained by, Description */}
      <div className="mt-2">
        {profile.maintainedBy && (
          <div className={`mb-2 ${profile.maintainedBy.toLowerCase() === 'remix' ? 'text-success' : 'text-body-secondary'}`}>
            <span className="font-weight-bold">Maintained by {profile.maintainedBy}</span>
            <i className={`fa-solid fa-shield-halved ml-2`}></i>
          </div>
        )}
        <p className="text-body small">{profile.description}</p>
      </div>

      {/* 카드 푸터: 문서 버튼 */}
      {profile.documentation && (
        <a href={profile.documentation} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary w-100 text-decoration-none">
          <i className="fas fa-book mr-2"></i>
          <FormattedMessage id="pluginManager.openDocumentation" defaultMessage="Open documentation" />
        </a>
      )}
    </article>
  )
}

export default PluginCard