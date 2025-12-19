#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = [
#     "requests",
#     "python-dotenv",
# ]
# ///
"""
PriceRunner API Client

Usage:
    Search products:
        uv run pricerunner.py search --market SE --query "iphone 15" --size 10

    Get product offers:
        uv run pricerunner.py offers --market SE --product-ids "123,456" --min-price 100 --max-price 500
"""

import argparse
import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://api.pricerunner.com"
API_KEY = os.getenv("KLARNA_API_KEY")


def search_products(market: str, query: str, size: int = None, offset: int = None, sort_orders: str = None):
    """Search for products on PriceRunner."""
    url = f"{BASE_URL}/agentic/v1/product/search/{market}"

    headers = {"tokenId": API_KEY}
    params = {"q": query}

    if size:
        params["size"] = size
    if offset:
        params["offset"] = offset
    if sort_orders:
        params["sortOrders"] = sort_orders

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()


def get_offers(market: str, product_ids: str, min_price: int = None, max_price: int = None, condition: str = None):
    """Get product offers/listings from PriceRunner."""
    url = f"{BASE_URL}/agentic/v1/product/offers/{market}"

    headers = {"tokenId": API_KEY}
    params = {"productIdentifiers": product_ids}

    if min_price:
        params["minPrice"] = min_price
    if max_price:
        params["maxPrice"] = max_price
    if condition:
        params["itemConditionFilters"] = condition

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()


def main():
    parser = argparse.ArgumentParser(description="PriceRunner API Client")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Search command
    search_parser = subparsers.add_parser("search", help="Search for products")
    search_parser.add_argument("--market", "-m", required=True, help="Market code (e.g., SE, DK, NO)")
    search_parser.add_argument("--query", "-q", required=True, help="Search query (max 100 chars)")
    search_parser.add_argument("--size", "-s", type=int, help="Number of results (max 25)")
    search_parser.add_argument("--offset", "-o", type=int, help="Pagination offset")
    search_parser.add_argument("--sort", help="Sort order: POPULARITY, NAME, RATING, TREND, HOT")

    # Offers command
    offers_parser = subparsers.add_parser("offers", help="Get product offers/listings")
    offers_parser.add_argument("--market", "-m", required=True, help="Market code (e.g., SE, DK, NO)")
    offers_parser.add_argument("--product-ids", "-p", required=True, help="Product identifiers (comma-separated)")
    offers_parser.add_argument("--min-price", type=int, help="Minimum price filter")
    offers_parser.add_argument("--max-price", type=int, help="Maximum price filter")
    offers_parser.add_argument("--condition", help="Item condition: NEW, UNKNOWN (default: NEW,UNKNOWN)")

    args = parser.parse_args()

    if args.command == "search":
        result = search_products(
            market=args.market,
            query=args.query,
            size=args.size,
            offset=args.offset,
            sort_orders=args.sort
        )
    elif args.command == "offers":
        result = get_offers(
            market=args.market,
            product_ids=args.product_ids,
            min_price=args.min_price,
            max_price=args.max_price,
            condition=args.condition
        )

    import json
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
