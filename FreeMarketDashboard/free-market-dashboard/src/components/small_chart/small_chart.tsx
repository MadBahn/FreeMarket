import React from 'react';
import { Chart, Coordinate, Annotation, Axis, Point } from "bizcharts";

function SmallChart({data, item}) {

    const animation = {
        animation: 'scale-in-x',
        duration: 600
    }
    // @ts-ignore
    return (
        <Chart
            padding='4vw'
            animate={animation}
            placeholder={false}
            width='14vw'
            height='14vw'
            scale={{
                value: {
                    min: 0,
                    max: 1.5,
                    tickInterval: 0.1,
                    formatter: v => v * 100
                }
            }}
            autoFit
        >
            <Coordinate
                type="polar"
                innerRadius={0.5}
            />
            <Axis
                name="value"
                line={null}
                visible={false}
                label={{
                    offset: -36,
                    style: {
                        fontSize: 18,
                        textAlign: 'center',
                        textBaseline: 'middle',
                    },
                }}

                grid={null}
            />
            <Point
                position="value"
                color="#1890FF"
                shape="pointer"
            />
            {/*base*/}
            <Annotation.Arc
                start={[0, 1]}
                end={[1, 1]}
                style={{
                    stroke: '#CBCBCB',
                    lineWidth: 14,
                    lineDash: null,
                    lineCap: 'round',
                }}
            />
            {/*fill*/}
            <Annotation.Arc
                start={[0, 1]}
                end={[data[0].value, 1]}
                style={{
                    stroke: '#1890FF',
                    lineCap: 'round',
                    lineWidth: 14,
                    lineDash: null,
                }}
            />
            {/*tips*/}
            <Annotation.Text
                position={['50%', '50%']}
                content={`${item}\n${(data[0].value * 100).toFixed(2)}%`}
                style={{
                    fontSize: 30,
                    fill: '#262626',
                    textAlign: 'center',
                }}
            />
        </Chart>
    );
}

export default SmallChart;