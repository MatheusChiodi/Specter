//! Conversão de dimensões do terminal para `PtySize`.

use portable_pty::PtySize;

/// Monta um `PtySize` a partir de linhas/colunas, garantindo mínimo de 1
/// (ConPTY rejeita dimensão zero).
pub fn pty_size(rows: u16, cols: u16) -> PtySize {
    PtySize {
        rows: rows.max(1),
        cols: cols.max(1),
        pixel_width: 0,
        pixel_height: 0,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn aplica_minimo_de_um() {
        let s = pty_size(0, 0);
        assert_eq!(s.rows, 1);
        assert_eq!(s.cols, 1);
    }

    #[test]
    fn preserva_valores_validos() {
        let s = pty_size(24, 80);
        assert_eq!(s.rows, 24);
        assert_eq!(s.cols, 80);
    }
}
