import { useMutation, useQueryClient } from "@tanstack/react-query";
import { todoApi } from "../api/todos";

const useTodoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, currentLiked }) => {
      await todoApi.patch(`/todos/${id}`, {
        liked: !currentLiked,
      });
    },
    onMutate: async ({ id }) => {
      // UI 부터 바꾼다!
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      const previousTodos = queryClient.getQueryData(["todos"]);
      queryClient.setQueryData(["todos"], (prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, liked: !todo.liked } : todo,
        ),
      );
      return { previousTodos };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(["todos"], () => context.previousTodos);
    },
    onSettled: () => {
      // DB 의 데이터와 UI 데이터를 동기화
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export default useTodoMutation;
