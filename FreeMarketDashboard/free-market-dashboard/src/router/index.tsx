import React, {lazy} from "react";
import { Navigate } from "react-router-dom";

const Home = lazy(() => import("../views/home/home"));
const Login = lazy(() => import("../views/login/login"));

const Main = lazy(() => import("../views/home/subviews/main/main"));
const Data =  lazy(() => import("../views/home/subviews/data/data"));
const Report = lazy(() => import("../views/home/subviews/report/report"));
const Info = lazy(() => import("../views/home/subviews/info/info"));

const Loading = lazy(() => import("../components/loading"));

const loading = (comp: React.ReactElement<any,any>) => (
    <React.Suspense fallback={<Loading/>}>
        {comp}
    </React.Suspense>
);

const routes = [
    {
        path: "/",
        element: <Navigate to="/login" />
    },
    {
        path: "/login",
        element: loading(<Login />)
    },
    {
        path: "/",
        element: loading(<Home />),
        children: [
            {
                path: "/main",
                element: loading(<Main />)
            },
            {
                path: "/data",
                element: loading(<Data />)
            },
            {
                path: "/report",
                element: loading(<Report />)
            },
            {
                path: "/info",
                element: loading(<Info />)
            }
        ]
    },
]

export default routes;