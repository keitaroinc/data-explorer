import React, {useEffect} from 'react'
import { connect } from 'react-redux'
import './App.css'
import { QueryBuilder } from './components/QueryBuilder/QueryBuilder'
import DataView from './components/DataView'
import Pagination from './components/Pagination'
import { ChartBuilder } from '@datopian/chart-builder'
import { MapBuilder } from '@datopian/map-builder'
import { Tabs, TabLink, TabContent } from 'react-tabs-redux'
import { filterUIAction, fetchDataAction, dataViewBuilderAction, selectTabAction } from './actions/'
import { getResourceForFiltering, showQueryBuilder } from './utils'

import "./i18n/i18n";
import { useTranslation } from "react-i18next";

export const App = props => {
  useEffect(() => {
    const payload = {
      datapackage: props.datapackage,
      widgets: props.widgets
    }
    props.fetchDataAction(payload)
  }, [])

  const activeWidget = props.widgets.find(widget => {
    return widget.active
  })

  const { t } = useTranslation();

  // Check if any of widgets requires datastore specific components:
  const nonDataStoreViewTypes = ['web', 'document']
  const datastoreComponents = props.widgets.find(widget => {
    return widget.datapackage.views
      .find(view => !nonDataStoreViewTypes.includes(view.specType))
  })

  //TODO: remove rowcount?
  const totalRows =
        props.datapackage.resources[0].datastore_active
          ? props.datapackage.resources[0].totalrowcount
          : ''

  const selectedTab = activeWidget ? activeWidget.name : props.widgets[0].name
  const tabLinks = props.widgets.map((widget, index) => {
    return <TabLink to={widget.name} className='mr-4' key={`tabLink-${index}`}>{t(widget.name)}</TabLink>
  })


  const tabContents = props.widgets.map((widget, index) => {
    return <TabContent for={widget.name} key={`tabContent-${index}`}>
        {
          (['table', 'web'].includes(widget.datapackage.views[0].specType))
          ? <div className="container flex py-6">
              <div className="w-full py-3">
                <DataView {...widget} />
              </div>
            </div>
          : <div className="container flex py-6">
              <div className="w-3/4 py-3 mr-4">
                <DataView {...widget} />
              </div>
              <div className="w-1/4">
                <div className="w-full">
                  <div className="p-4 mr-4">
                   {
                      widget.datapackage.views[0].specType === 'simple'
                      ? <ChartBuilder view={widget.datapackage.views[0]} dataViewBuilderAction={props.dataViewBuilderAction} />
                      : ''
                    }
                    {
                      widget.datapackage.views[0].specType === 'tabularmap'
                      ? <MapBuilder view={widget.datapackage.views[0]} dataViewBuilderAction={props.dataViewBuilderAction} />
                      : ''
                    }
                  </div>
                </div>
              </div>
            </div>
        }
    </TabContent>
  })

  return (
    <div className="data-explorer">
      {/* Data Editor (aka filters / datastore query builder) */}
      <div className="datastore-query-builder">
        {
          showQueryBuilder(props)
          ? <QueryBuilder resource={getResourceForFiltering(props.datapackage)} filterBuilderAction={props.filterUIAction} totalRows={totalRows} />
          : ''
        }
      </div>
      {/* End of Data Editor */}
      {/* Widgets (aka Views and Controls/Builders) */}
      <Tabs
        renderActiveTabContentOnly={true}
        handleSelect={(selectedTab) => {
          props.selectTabAction(selectedTab)
        }}
        className="data-explorer-content"
        selectedTab={selectedTab}>
          {tabLinks}
          {tabContents}
      </Tabs>

      {/* Pagination for DataStore resources */}
      {props.datapackage.resources[0].datastore_active && datastoreComponents
        ? <Pagination datapackage={props.datapackage} updateAction={props.filterUIAction} />
      : <div className="no-pagination not-datastore-resource"></div>
      }
      {/* End of Pagination */}

      {/* End of Widgets */}
     </div>
  )
}

const mapStateToProps = state => ({
 ...state
})

const mapDispatchToProps = dispatch => ({
 filterUIAction: (payload) => dispatch(filterUIAction(payload)),
 fetchDataAction: payload => dispatch(fetchDataAction(payload)),
 dataViewBuilderAction: payload => dispatch(dataViewBuilderAction(payload)),
 selectTabAction: payload => dispatch(selectTabAction(payload))
})

export default connect(mapStateToProps, mapDispatchToProps)(App)
