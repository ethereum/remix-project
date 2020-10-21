import { ContainerModule } from 'inversify';
import { RemixTheiaWidget } from './remix-theia-widget';
import { RemixTheiaContribution } from './remix-theia-contribution';
import { bindViewContribution, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';

import '../../src/browser/style/index.css';

export default new ContainerModule(bind => {
    bindViewContribution(bind, RemixTheiaContribution);
    bind(FrontendApplicationContribution).toService(RemixTheiaContribution);
    bind(RemixTheiaWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: RemixTheiaWidget.ID,
        createWidget: () => ctx.container.get<RemixTheiaWidget>(RemixTheiaWidget)
    })).inSingletonScope();
});
