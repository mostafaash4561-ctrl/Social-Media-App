import axios from "axios";
import { useEffect } from "react";
import Loader from "../../Components/Loader/Loader";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import BackToHome from "../../Components/BackToHome/BackToHome";
import Post from "../../Components/Post/Post";
import { Helmet } from "react-helmet";
import { getErrorMessage } from "../../Logic/getErrorMessage";

const MySwal = withReactContent(Swal);

export default function PostDetails() {
  const { id } = useParams();

  function getPostDetails() {
    return axios.get(`https://route-posts.routemisr.com/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    });
  }

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["getPostDetails", id],
    queryFn: getPostDetails,
  });

  useEffect(() => {
    if (isError) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(error),
      });
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <>
        <BackToHome />
        <Loader />
      </>
    );
  }

  const post = data?.data?.data?.post;

  if (isError || !post) {
    return <BackToHome />;
  }

  return (
    <>
      <Helmet>
        <title>{`${post.user.name}'s | Post Details`}</title>
      </Helmet>
      <BackToHome />
      <Post post={post} isPostDetails={true} />
    </>
  );
}
