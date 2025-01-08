import { CustomToggle, CustomTooltip, CustomMenu } from '@remix-ui/helper';
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

const EnvironmentDropdown = ({ currentProvider, isL2, bridges, handleChangeExEnv, props }) => {
  return (
    <Dropdown id="selectExEnvOptions" data-id="settingsSelectEnvOptions" className="udapp_selectExEnvOptions">
      <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control" icon={null}>
        {isL2(currentProvider && currentProvider.displayName)}
        {currentProvider && currentProvider.displayName}
        {currentProvider && bridges[currentProvider.displayName.substring(0, 13)] && (
          <CustomTooltip placement={'auto-end'} tooltipClasses="text-nowrap" tooltipId="info-recorder" tooltipText={<FormattedMessage id="udapp.tooltipText3" />}>
            <i
              style={{ fontSize: 'medium' }}
              className={'ml-2 fa fa-rocket-launch'}
              aria-hidden="true"
              onClick={() => {
                window.open(bridges[currentProvider.displayName.substring(0, 13)], '_blank')
              }}
            ></i>
          </CustomTooltip>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu as={CustomMenu} className="w-100 custom-dropdown-items" data-id="custom-dropdown-items">
        {props.providers.providerList.length === 0 && <Dropdown.Item>
          <span className="">
            No provider pinned
          </span>
        </Dropdown.Item>}
        { (props.providers.providerList.filter((provider) => { return provider.isInjected })).map(({ name, displayName }) => (
          <Dropdown.Item
            key={name}
            onClick={async () => {
              handleChangeExEnv(name)
            }}
            data-id={`dropdown-item-${name}`}
          >
            <span className="">
              {displayName}
            </span>
          </Dropdown.Item>
        ))}
        { props.providers.providerList.filter((provider) => { return provider.isInjected }).length !== 0 && <Dropdown.Divider className='border-secondary'></Dropdown.Divider> }
        { (props.providers.providerList.filter((provider) => { return provider.isVM })).map(({ displayName, name }) => (
          <Dropdown.Item
            key={name}
            onClick={() => {
              handleChangeExEnv(name)
            }}
            data-id={`dropdown-item-${name}`}
          >
            <span className="">
              {displayName}
            </span>
          </Dropdown.Item>
        ))}
        { props.providers.providerList.filter((provider) => { return provider.isVM }).length !== 0 && <Dropdown.Divider className='border-secondary'></Dropdown.Divider> }
        { (props.providers.providerList.filter((provider) => { return !(provider.isVM || provider.isInjected) })).map(({ displayName, name }) => (
          <Dropdown.Item
            key={name}
            onClick={() => {
              handleChangeExEnv(name)
            }}
            data-id={`dropdown-item-${name}`}
          >
            <span className="">
              {isL2(displayName)}
              {displayName}
            </span>
          </Dropdown.Item>
        ))}
        <Dropdown.Divider className='border-secondary'></Dropdown.Divider>
        <Dropdown.Item
          key={10000}
          onClick={() => {
            props.setExecutionContext({ context: 'item-another-chain' })
          }}
          data-id={`dropdown-item-another-chain`}
        >
          <span className="">
            Customize this list...
          </span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default EnvironmentDropdown;