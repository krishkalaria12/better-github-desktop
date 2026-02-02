#[macro_export]
macro_rules! impl_froms {
    () => {};

    // Case 1: With Arc
    ($variant:ident ($err_type:ty, arc), $($tail:tt)*) => {
        impl From<$err_type> for Error {
            fn from(val: $err_type) -> Self {
                Self::$variant(std::sync::Arc::new(val))
            }
        }
        $crate::impl_froms!($($tail)*);
    };

    // Case 2: Standard
    ($variant:ident ($err_type:ty), $($tail:tt)*) => {
        impl From<$err_type> for Error {
            fn from(val: $err_type) -> Self {
                Self::$variant(val)
            }
        }
        $crate::impl_froms!($($tail)*);
    };
}
