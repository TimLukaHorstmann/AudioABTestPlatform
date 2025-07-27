"use client";

export default function Error({error, reset}) {
  return (
    <div>
      <h4>
        Something went wrong! {error.message}
      </h4>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
