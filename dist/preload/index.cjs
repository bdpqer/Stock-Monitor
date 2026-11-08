// src/preload/utils.ts
function domReady(condition = ["complete", "interactive"]) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

// src/preload/loading.ts
function useLoading() {
  const className = `loaders-css__square-spin`;
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `;
  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");
  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`;
  return {
    appendLoading() {
      safe.append(document.head, oStyle);
      safe.append(document.body, oDiv);
    },
    removeLoading() {
      safe.remove(document.head, oStyle);
      safe.remove(document.body, oDiv);
    }
  };
}
var safe = {
  append(parent, child) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent, child) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  }
};

// src/preload/index.ts
var { appendLoading, removeLoading } = useLoading();
window.removeLoading = removeLoading;
domReady().then(appendLoading);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3ByZWxvYWQvdXRpbHMudHMiLCAiLi4vLi4vc3JjL3ByZWxvYWQvbG9hZGluZy50cyIsICIuLi8uLi9zcmMvcHJlbG9hZC9pbmRleC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiXG4vKiogZG9jb21lbnQgcmVhZHkgKi9cbmV4cG9ydCBmdW5jdGlvbiBkb21SZWFkeShjb25kaXRpb246IERvY3VtZW50UmVhZHlTdGF0ZVtdID0gWydjb21wbGV0ZScsICdpbnRlcmFjdGl2ZSddKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICBpZiAoY29uZGl0aW9uLmluY2x1ZGVzKGRvY3VtZW50LnJlYWR5U3RhdGUpKSB7XG4gICAgICByZXNvbHZlKHRydWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3JlYWR5c3RhdGVjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgIGlmIChjb25kaXRpb24uaW5jbHVkZXMoZG9jdW1lbnQucmVhZHlTdGF0ZSkpIHtcbiAgICAgICAgICByZXNvbHZlKHRydWUpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9KVxufVxuIiwgIi8qKlxuICogaHR0cHM6Ly90b2JpYXNhaGxpbi5jb20vc3BpbmtpdFxuICogaHR0cHM6Ly9jb25ub3JhdGhlcnRvbi5jb20vbG9hZGVyc1xuICogaHR0cHM6Ly9wcm9qZWN0cy5sdWtlaGFhcy5tZS9jc3MtbG9hZGVyc1xuICogaHR0cHM6Ly9tYXRlamt1c3RlYy5naXRodWIuaW8vU3BpblRoYXRTaGl0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VMb2FkaW5nKCkge1xuICBjb25zdCBjbGFzc05hbWUgPSBgbG9hZGVycy1jc3NfX3NxdWFyZS1zcGluYFxuICBjb25zdCBzdHlsZUNvbnRlbnQgPSBgXG5Aa2V5ZnJhbWVzIHNxdWFyZS1zcGluIHtcbiAgMjUlIHsgdHJhbnNmb3JtOiBwZXJzcGVjdGl2ZSgxMDBweCkgcm90YXRlWCgxODBkZWcpIHJvdGF0ZVkoMCk7IH1cbiAgNTAlIHsgdHJhbnNmb3JtOiBwZXJzcGVjdGl2ZSgxMDBweCkgcm90YXRlWCgxODBkZWcpIHJvdGF0ZVkoMTgwZGVnKTsgfVxuICA3NSUgeyB0cmFuc2Zvcm06IHBlcnNwZWN0aXZlKDEwMHB4KSByb3RhdGVYKDApIHJvdGF0ZVkoMTgwZGVnKTsgfVxuICAxMDAlIHsgdHJhbnNmb3JtOiBwZXJzcGVjdGl2ZSgxMDBweCkgcm90YXRlWCgwKSByb3RhdGVZKDApOyB9XG59XG4uJHtjbGFzc05hbWV9ID4gZGl2IHtcbiAgYW5pbWF0aW9uLWZpbGwtbW9kZTogYm90aDtcbiAgd2lkdGg6IDUwcHg7XG4gIGhlaWdodDogNTBweDtcbiAgYmFja2dyb3VuZDogI2ZmZjtcbiAgYW5pbWF0aW9uOiBzcXVhcmUtc3BpbiAzcyAwcyBjdWJpYy1iZXppZXIoMC4wOSwgMC41NywgMC40OSwgMC45KSBpbmZpbml0ZTtcbn1cbi5hcHAtbG9hZGluZy13cmFwIHtcbiAgcG9zaXRpb246IGZpeGVkO1xuICB0b3A6IDA7XG4gIGxlZnQ6IDA7XG4gIHdpZHRoOiAxMDB2dztcbiAgaGVpZ2h0OiAxMDB2aDtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGJhY2tncm91bmQ6ICMyODJjMzQ7XG4gIHotaW5kZXg6IDk7XG59XG4gICAgYFxuICBjb25zdCBvU3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gIGNvbnN0IG9EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gIG9TdHlsZS5pZCA9ICdhcHAtbG9hZGluZy1zdHlsZSdcbiAgb1N0eWxlLmlubmVySFRNTCA9IHN0eWxlQ29udGVudFxuICBvRGl2LmNsYXNzTmFtZSA9ICdhcHAtbG9hZGluZy13cmFwJ1xuICBvRGl2LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiJHtjbGFzc05hbWV9XCI+PGRpdj48L2Rpdj48L2Rpdj5gXG5cbiAgcmV0dXJuIHtcbiAgICBhcHBlbmRMb2FkaW5nKCkge1xuICAgICAgc2FmZS5hcHBlbmQoZG9jdW1lbnQuaGVhZCwgb1N0eWxlKVxuICAgICAgc2FmZS5hcHBlbmQoZG9jdW1lbnQuYm9keSwgb0RpdilcbiAgICB9LFxuICAgIHJlbW92ZUxvYWRpbmcoKSB7XG4gICAgICBzYWZlLnJlbW92ZShkb2N1bWVudC5oZWFkLCBvU3R5bGUpXG4gICAgICBzYWZlLnJlbW92ZShkb2N1bWVudC5ib2R5LCBvRGl2KVxuICAgIH0sXG4gIH1cbn1cblxuY29uc3Qgc2FmZSA9IHtcbiAgYXBwZW5kKHBhcmVudDogSFRNTEVsZW1lbnQsIGNoaWxkOiBIVE1MRWxlbWVudCkge1xuICAgIGlmICghQXJyYXkuZnJvbShwYXJlbnQuY2hpbGRyZW4pLmZpbmQoZSA9PiBlID09PSBjaGlsZCkpIHtcbiAgICAgIHJldHVybiBwYXJlbnQuYXBwZW5kQ2hpbGQoY2hpbGQpXG4gICAgfVxuICB9LFxuICByZW1vdmUocGFyZW50OiBIVE1MRWxlbWVudCwgY2hpbGQ6IEhUTUxFbGVtZW50KSB7XG4gICAgaWYgKEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuKS5maW5kKGUgPT4gZSA9PT0gY2hpbGQpKSB7XG4gICAgICByZXR1cm4gcGFyZW50LnJlbW92ZUNoaWxkKGNoaWxkKVxuICAgIH1cbiAgfSxcbn1cbiIsICJpbXBvcnQgeyBkb21SZWFkeSB9IGZyb20gJy4vdXRpbHMnXG5pbXBvcnQgeyB1c2VMb2FkaW5nIH0gZnJvbSAnLi9sb2FkaW5nJ1xuXG5jb25zdCB7IGFwcGVuZExvYWRpbmcsIHJlbW92ZUxvYWRpbmcgfSA9IHVzZUxvYWRpbmcoKVxud2luZG93LnJlbW92ZUxvYWRpbmcgPSByZW1vdmVMb2FkaW5nXG5cbmRvbVJlYWR5KCkudGhlbihhcHBlbmRMb2FkaW5nKVxuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBRU8sU0FBUyxTQUFTLFlBQWtDLENBQUMsWUFBWSxhQUFhLEdBQUc7QUFDdEYsU0FBTyxJQUFJLFFBQVEsYUFBVztBQUM1QixRQUFJLFVBQVUsU0FBUyxTQUFTLFVBQVUsR0FBRztBQUMzQyxjQUFRLElBQUk7QUFBQSxJQUNkLE9BQU87QUFDTCxlQUFTLGlCQUFpQixvQkFBb0IsTUFBTTtBQUNsRCxZQUFJLFVBQVUsU0FBUyxTQUFTLFVBQVUsR0FBRztBQUMzQyxrQkFBUSxJQUFJO0FBQUEsUUFDZDtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGLENBQUM7QUFDSDs7O0FDUk8sU0FBUyxhQUFhO0FBQzNCLFFBQU0sWUFBWTtBQUNsQixRQUFNLGVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQU9wQixTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFvQlYsUUFBTSxTQUFTLFNBQVMsY0FBYyxPQUFPO0FBQzdDLFFBQU0sT0FBTyxTQUFTLGNBQWMsS0FBSztBQUV6QyxTQUFPLEtBQUs7QUFDWixTQUFPLFlBQVk7QUFDbkIsT0FBSyxZQUFZO0FBQ2pCLE9BQUssWUFBWSxlQUFlLFNBQVM7QUFFekMsU0FBTztBQUFBLElBQ0wsZ0JBQWdCO0FBQ2QsV0FBSyxPQUFPLFNBQVMsTUFBTSxNQUFNO0FBQ2pDLFdBQUssT0FBTyxTQUFTLE1BQU0sSUFBSTtBQUFBLElBQ2pDO0FBQUEsSUFDQSxnQkFBZ0I7QUFDZCxXQUFLLE9BQU8sU0FBUyxNQUFNLE1BQU07QUFDakMsV0FBSyxPQUFPLFNBQVMsTUFBTSxJQUFJO0FBQUEsSUFDakM7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxJQUFNLE9BQU87QUFBQSxFQUNYLE9BQU8sUUFBcUIsT0FBb0I7QUFDOUMsUUFBSSxDQUFDLE1BQU0sS0FBSyxPQUFPLFFBQVEsRUFBRSxLQUFLLE9BQUssTUFBTSxLQUFLLEdBQUc7QUFDdkQsYUFBTyxPQUFPLFlBQVksS0FBSztBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTyxRQUFxQixPQUFvQjtBQUM5QyxRQUFJLE1BQU0sS0FBSyxPQUFPLFFBQVEsRUFBRSxLQUFLLE9BQUssTUFBTSxLQUFLLEdBQUc7QUFDdEQsYUFBTyxPQUFPLFlBQVksS0FBSztBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUNGOzs7QUMvREEsSUFBTSxFQUFFLGVBQWUsY0FBYyxJQUFJLFdBQVc7QUFDcEQsT0FBTyxnQkFBZ0I7QUFFdkIsU0FBUyxFQUFFLEtBQUssYUFBYTsiLAogICJuYW1lcyI6IFtdCn0K
