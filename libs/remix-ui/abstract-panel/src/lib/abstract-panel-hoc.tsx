import React from 'react'

function AbstractPanelHOC (WrappedComponent: any) {
    return (WrappedComponent: any) => {
        const WithAbstractPanel = (props: any) => {
            return (
                <WrappedComponent
                    {...props}
                />
            )
        }
        return WithAbstractPanel;
    }
}

export default AbstractPanelHOC