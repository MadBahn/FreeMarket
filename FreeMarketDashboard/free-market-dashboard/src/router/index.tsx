import React, {lazy} from "react";
import { Navigate } from "react-router-dom";
import Error from "@/views/error/error";

const Home = lazy(() => import("@/views/home/home"));
const Login = lazy(() => import("@/views/login/login"));

const Main = lazy(() => import("@/views/home/subviews/main/main"));
const Data =  lazy(() => import("@/views/home/subviews/data/data"));
const Report = lazy(() => import("@/views/home/subviews/report/report"));
const Info = lazy(() => import("@/views/home/subviews/info/info"));
const User = lazy(() => import("@/views/home/subviews/user/user"))

const Loading = lazy(() => import("@/components/loading/loading"));

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
        path: "*",
        element: <Error />
    },
    {
        path: "/",
        element: loading(<Home />),
        errorElement: <Error />,
        children: [
            {
                path: "/main",
                element: loading(<Main />)
            },
            {
                path: "/user",
                element: loading(<User />)
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