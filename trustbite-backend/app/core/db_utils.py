import logging

logger = logging.getLogger(__name__)

def resolve_db_url_to_ipv4(url_str: str) -> str:
    """
    Parses a database URL and resolves the hostname to an IPv4 address.
    Appends ?hostaddr=<ipv4> to the connection string to bypass IPv6 DNS resolution issues,
    which is particularly useful for Neon PostgreSQL databases.
    """
    if url_str.startswith("sqlite"):
        return url_str
    try:
        import socket
        from sqlalchemy.engine.url import make_url
        u = make_url(url_str)
        if not u.host:
            return url_str
        ip_addr = socket.gethostbyname(u.host)
        new_query = dict(u.query)
        new_query['hostaddr'] = ip_addr
        return u.set(query=new_query).render_as_string(hide_password=False)
    except Exception as e:
        logger.warning(f"IPv4 resolution failed: {e}")
        return url_str
