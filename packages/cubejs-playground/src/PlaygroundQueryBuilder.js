import React, { useState } from 'react';
import * as PropTypes from 'prop-types';
import { Row, Col, Divider, Card, Button, Popover } from 'antd';
import { SortAscendingOutlined } from '@ant-design/icons';
import { QueryBuilder } from '@cubejs-client/react';
import { ChartRenderer } from './ChartRenderer';
import { playgroundAction } from './events';
import MemberGroup from './QueryBuilder/MemberGroup';
import FilterGroup from './QueryBuilder/FilterGroup';
import TimeGroup from './QueryBuilder/TimeGroup';
import SelectChartType from './QueryBuilder/SelectChartType';
import OrderGroup from './components/Order/OrderGroup';

const playgroundActionUpdateMethods = (updateMethods, memberName) =>
  Object.keys(updateMethods)
    .map((method) => ({
      [method]: (member, values, ...rest) => {
        let actionName = `${method
          .split('')
          .map((c, i) => (i === 0 ? c.toUpperCase() : c))
          .join('')} Member`;
        if (values && values.values) {
          actionName = 'Update Filter Values';
        }
        if (values && values.dateRange) {
          actionName = 'Update Date Range';
        }
        if (values && values.granularity) {
          actionName = 'Update Granularity';
        }
        playgroundAction(actionName, { memberName });
        return updateMethods[method].apply(null, [member, values, ...rest]);
      }
    }))
    .reduce((a, b) => ({ ...a, ...b }), {});

export default function PlaygroundQueryBuilder({ query, cubejsApi, apiUrl, cubejsToken, dashboardSource, setQuery }) {
  const [isOrderPopoverVisible, toggleOrderPopover] = useState(false);

  return (
    <QueryBuilder
      query={query}
      setQuery={setQuery}
      cubejsApi={cubejsApi}
      render={({
        resultSet,
        error,
        validatedQuery,
        isQueryPresent,
        chartType,
        updateChartType,
        measures,
        availableMeasures,
        updateMeasures,
        dimensions,
        availableDimensions,
        updateDimensions,
        segments,
        availableSegments,
        updateSegments,
        filters,
        updateFilters,
        timeDimensions,
        availableTimeDimensions,
        updateTimeDimensions,
        orderMembers,
        updateOrder
      }) => {
        return (
          <>
            <Row justify="space-around" align="top" gutter={24} style={{ marginBottom: 12 }}>
              <Col span={24}>
                <Card>
                  <Row justify="space-around" align="top" gutter={24} style={{ marginBottom: 12 }}>
                    <Col span={24}>
                      <MemberGroup
                        members={measures}
                        availableMembers={availableMeasures}
                        addMemberName="Measure"
                        updateMethods={playgroundActionUpdateMethods(updateMeasures, 'Measure')}
                      />
                      <Divider type="vertical" />
                      <MemberGroup
                        members={dimensions}
                        availableMembers={availableDimensions}
                        addMemberName="Dimension"
                        updateMethods={playgroundActionUpdateMethods(updateDimensions, 'Dimension')}
                      />
                      <Divider type="vertical" />
                      <MemberGroup
                        members={segments}
                        availableMembers={availableSegments}
                        addMemberName="Segment"
                        updateMethods={playgroundActionUpdateMethods(updateSegments, 'Segment')}
                      />
                      <Divider type="vertical" />
                      <TimeGroup
                        members={timeDimensions}
                        availableMembers={availableTimeDimensions}
                        addMemberName="Time"
                        updateMethods={playgroundActionUpdateMethods(updateTimeDimensions, 'Time')}
                      />
                    </Col>
                  </Row>

                  <Row justify="space-around" align="top" gutter={24} style={{ marginBottom: 12 }}>
                    <Col span={24}>
                      <FilterGroup
                        members={filters}
                        availableMembers={availableDimensions.concat(availableMeasures)}
                        addMemberName="Filter"
                        updateMethods={playgroundActionUpdateMethods(updateFilters, 'Filter')}
                      />
                    </Col>
                  </Row>

                  <Row justify="space-around" align="top" gutter={24} style={{ marginBottom: 12 }}>
                    <Col span={24}>
                      <SelectChartType
                        chartType={chartType}
                        updateChartType={(type) => {
                          playgroundAction('Change Chart Type');
                          updateChartType(type);
                        }}
                      />

                      <Divider type="vertical" />

                      <Popover
                        content={
                          <OrderGroup
                            orderMembers={orderMembers}
                            onReorder={updateOrder.reorder}
                            onOrderChange={updateOrder.set}
                          />
                        }
                        visible={isOrderPopoverVisible}
                        placement="bottomLeft"
                        trigger="click"
                        onVisibleChange={(visible) => {
                          if (!visible) {
                            toggleOrderPopover(false);
                          } else {
                            if (orderMembers.length) {
                              toggleOrderPopover(!isOrderPopoverVisible);
                            }
                          }
                        }}
                      >
                        <Button disabled={!orderMembers.length} icon={<SortAscendingOutlined />}>
                          Order
                        </Button>
                      </Popover>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            <Row justify="space-around" align="top" gutter={24}>
              <Col span={24}>
                {isQueryPresent ? (
                  <ChartRenderer
                    query={validatedQuery}
                    resultSet={resultSet}
                    error={error}
                    apiUrl={apiUrl}
                    cubejsToken={cubejsToken}
                    chartType={chartType}
                    cubejsApi={cubejsApi}
                    dashboardSource={dashboardSource}
                  />
                ) : (
                  <h2 style={{ textAlign: 'center' }}>Choose a measure or dimension to get started</h2>
                )}
              </Col>
            </Row>
          </>
        );
      }}
    />
  );
}

PlaygroundQueryBuilder.propTypes = {
  query: PropTypes.object,
  setQuery: PropTypes.func,
  cubejsApi: PropTypes.object,
  dashboardSource: PropTypes.object,
  apiUrl: PropTypes.string,
  cubejsToken: PropTypes.string
};

PlaygroundQueryBuilder.defaultProps = {
  query: {},
  setQuery: null,
  cubejsApi: null,
  dashboardSource: null,
  apiUrl: '/cubejs-api/v1',
  cubejsToken: null
};
